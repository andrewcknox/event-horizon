const SCHEMA = {
  categories: [
    { code: "Z", label: "Sleep", keywords: ["sleep", "asleep", "bed", "nap", "woke up", "wake up"] },
    { code: "G", label: "Family", keywords: ["mom", "dad", "family", "dog"] },
    { code: "F", label: "Friends", keywords: ["friend", "calling", "called", "hang out"] },
    { code: "D", label: "Dating", keywords: ["date", "dating"] },
    { code: "S", label: "Studying", keywords: ["study", "studied", "homework", "anki", "flashcards", "reading for class"] },
    { code: "W", label: "Work", keywords: ["work", "internship", "application", "research", "article", "proposal", "career"] },
    { code: "B", label: "Productive", keywords: ["prepare", "planning", "file", "documents", "errand", "admin", "organize", "clean"] },
    { code: "A", label: "Hobbies and Skills", keywords: ["music", "reading", "language", "hobby"] },
    { code: "R", label: "Relaxation and Leisure", keywords: ["relax", "rest", "courtyard", "chill", "leisure", "free time"] },
    { code: "E", label: "Exercise", keywords: ["gym", "exercise", "physical therapy", "workout", "weight training", "cardio"] },
    { code: "H", label: "Health", keywords: ["food", "eat", "lunch", "dinner", "shower", "skin care", "meds", "medicine", "doctor"] },
    { code: "X", label: "Waste", keywords: ["scroll", "instagram", "waste", "procrastinated", "random stuff"] },
    { code: "V", label: "Transportation (maybe Vehicular)", keywords: ["get to", "commute", "bus", "metro", "train", "drive", "bike", "flight", "airport"] },
    { code: "C", label: "Class", keywords: ["class", "lecture", "seminar", "professor"] },
    { code: "Q", label: "Daily Necessities", keywords: ["get ready", "coffee", "brush teeth", "floss", "laundry", "groceries"] },
    { code: "T", label: "Travel or exploring", keywords: ["travel", "explore", "exploring", "tour", "walked around"] },
    { code: "N", label: "Networking", keywords: ["networking", "informational", "meeting", "coffee chat"] }
  ],
  surveys: {
    morning: [
      { id: "datem", label: "What is today's date? YYYYMMDD", type: "text", prompt: "What is today's date? YYYYMMDD", includeInUi: false },
      { id: "sleep", label: "Sleep Time and Location", type: "form", prompt: "Sleep Time and Location", fields: ["Time I fell asleep", "Time I woke up", "Location (City)", "Time I got out of bed"] },
      { id: "quality", label: "Sleep Ratings", type: "slider", prompt: "Sleep Ratings", fields: ["Sleep quality", "Number of wake-ups", "How energetic do you feel waking up?"] },
      { id: "disruption", label: "Sleep potentially disrupted by:", type: "multi", prompt: "Sleep potentially disrupted by:", choices: ["Stress", "Noise", "Caffeine", "Screens", "Something else"] },
      { id: "intention-1", label: "Intention for today: Today, I want...", type: "text", prompt: "Intention for today: Today, I want..." },
      { id: "intention-2", label: "Broader intention: I want...", type: "text", prompt: "Broader intention: I want..." },
      { id: "ruleplan", label: "What will you try to do to keep with the rule of the day?", type: "text", prompt: "What will you try to do to keep with the rule of the day?" },
      { id: "weight", label: "Weight (lbs)", type: "number", prompt: "Weight (lbs)" }
    ],
    night: [
      { id: "daten", label: "What is today's date? YYYYMMDD", type: "text", prompt: "What is today's date? YYYYMMDD", includeInUi: false },
      { id: "interaction", label: "Who did I interact with today, beyond basic pleasantries? (including calling)", type: "multi", prompt: "Who did I interact with today, beyond basic pleasantries? (including calling)", choices: ["Spouse/partner", "Family member", "Friend", "Coworker", "Neighbor"] },
      { id: "hobbies", label: "Did I engage in any of these hobbies today?", type: "multi", prompt: "Did I engage in any of these hobbies today?", choices: ["Reading for fun", "Music listening", "Time outdoors", "Playing an instrument"] },
      { id: "mental", label: "Mood and accomplishment", type: "slider", prompt: "Mood and accomplishment", fields: ["How much joy?", "Did I get done what I needed to today?"] },
      { id: "intentioncheck", label: "Today, you set a daily intention. Did you accomplish this goal?", type: "single", prompt: "Today, you set a daily intention. Did you accomplish this goal?", choices: ["I did accomplish this goal today!", "I did *not* accomplish this goal today.", "Eh, it's complicated.", "No, I actually did not set an intention."] },
      { id: "rulecheck", label: "Rule of the day", type: "ruleRatings", prompt: "Rule of the day" },
      { id: "dailycheck", label: "Daily goals", type: "dailyGoals", prompt: "Daily goals" },
      { id: "flowers", label: "Rose, Thorn, and Bud", type: "form", prompt: "Rose, Thorn, and Bud", fields: ["What's a good thing that happened today?", "What's a bad thing that happened today?", "What's something you're looking forward to?"] },
      { id: "exercise", label: "Exercise", type: "multi", prompt: "Exercise", choices: ["Walk", "Run", "Gym", "Stretching", "Other exercise"] },
      { id: "naps", label: "Did you take any naps today? HH:MM-HH:MM; HH:MM-HH:MM", type: "text", prompt: "Did you take any naps today? HH:MM-HH:MM; HH:MM-HH:MM" },
      { id: "memorable-experience", label: "What's the most memorable personal experience from today?", type: "textImage", prompt: "What's the most memorable personal experience from today?" }
    ]
  }
};

const HOURS = Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, "0")}:00`);
const STORAGE_KEY = "aa-journal-capture-v1";
const THEME_COLORS = {
  morning: { bg: "#f6f5ef", panel: "#fffefa", accent: "#116b68", ink: "#1d2528" },
  night: { bg: "#111718", panel: "#182121", accent: "#6fc7bc", ink: "#eef4f2" }
};
const ZHONGWEN_SELECTORS = [
  "#zhongwen-window",
  "#zhongwen-wordlist",
  "#zhongwen-translator",
  "#zhongwen-tooltip",
  "[id^='zhongwen' i]",
  "[id*='zhongwen' i]",
  "[class^='zhongwen' i]",
  "[class*=' zhongwen' i]"
];
const TASK_SECTIONS = [
  { key: "rightNow", title: "Do right now", empty: "Nothing queued for right now." },
  { key: "today", title: "Today", empty: "Nothing scheduled for today." },
  { key: "inbox", title: "Inbox", empty: "No unsorted tasks." },
  { key: "upcoming", title: "Upcoming", empty: "Nothing scheduled after today." }
];
const OVERDUE_SECTION = { key: "overdue", title: "Overdue", empty: "Nothing overdue." };
const TASK_SECTION_KEYS = TASK_SECTIONS.map((section) => section.key);
// Surfaces a task can be checked off from, mirrored in server.cjs against
// taskCompletionSurfaces. Absent (null) means the task was completed before the
// field existed, which is not the same as an unknown surface.
const TASK_COMPLETION_SURFACES = ["hud", "app"];
const TASK_FILTERS = [
  { key: "all", label: "All" },
  { key: "overdue", label: "Overdue" },
  { key: "rightNow", label: "Do right now" },
  { key: "inbox", label: "Inbox" },
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "projects", label: "Projects" },
  { key: "labels", label: "Labels" },
  { key: "priority", label: "Priority" }
];
const PRIORITY_OPTIONS = [
  { value: "p1", label: "P1" },
  { value: "p2", label: "P2" },
  { value: "p3", label: "P3" },
  { value: "p4", label: "P4" }
];
const CALENDAR_CATEGORIES = [
  { code: "Z", label: "Sleep", color: "#1f2933" },
  { code: "G", label: "Family", color: "#a855f7" },
  { code: "F", label: "Friends", color: "#c084fc" },
  { code: "D", label: "Dating", color: "#f472b6" },
  { code: "S", label: "Studying", color: "#60a5fa" },
  { code: "W", label: "Work", color: "#f59e0b" },
  { code: "B", label: "Productive", color: "#22d3ee" },
  { code: "A", label: "Hobbies and Skills", color: "#86efac" },
  { code: "R", label: "Relaxation and Leisure", color: "#f87171" },
  { code: "E", label: "Exercise", color: "#2563eb" },
  { code: "H", label: "Health", color: "#e5e7eb" },
  { code: "X", label: "Waste", color: "#ef4444" },
  { code: "V", label: "Transportation", color: "#fbbf24" },
  { code: "C", label: "Class", color: "#fb923c" },
  { code: "Q", label: "Daily Necessities", color: "#d1d5db" },
  { code: "T", label: "Travel or exploring", color: "#4ade80" },
  { code: "N", label: "Networking", color: "#f0abfc" }
];
const CALENDAR_COLORS = CALENDAR_CATEGORIES.map((category) => category.color);
// The one colour on the calendar that never comes from a category: deadlines
// are drawn in the same red as the now line, because both mark moments the
// rest of the day has to arrange itself around.
const CALENDAR_DEADLINE_COLOR = "#dc2626";
const CALENDAR_VIEW_MODES = ["month", "week", "day"];
const CALENDAR_VIEW_MODE_LABELS = { month: "M", week: "W", day: "D" };
const CALENDAR_KIND_FILTERS = ["plan", "both", "actual"];
const CALENDAR_WEEKDAYS = [
  { value: 0, label: "S" },
  { value: 1, label: "M" },
  { value: 2, label: "T" },
  { value: 3, label: "W" },
  { value: 4, label: "T" },
  { value: 5, label: "F" },
  { value: 6, label: "S" }
];
const CALENDAR_RECURRENCE_OPTIONS = [
  { value: "none", label: "Does not repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" }
];
const CALENDAR_DAY_START_HOUR = 0;
const CALENDAR_DAY_END_HOUR = 24;
const CALENDAR_SNAP_MINUTES = 5;
// How long a finger must hold still before a touch on the grid stops being a
// scroll/tap and becomes a drag (move a block, draw a new event).
const CALENDAR_TOUCH_HOLD_MS = 350;
// Calendar-only zoom. The grid (and only the grid) is scaled with CSS `zoom`,
// so looking at the calendar closely never enlarges the toolbar, the nav or any
// other view. Steps are coarse enough that one wheel notch is a visible change.
const CALENDAR_ZOOM_LEVELS = [0.7, 0.8, 0.9, 1, 1.15, 1.35, 1.6, 1.9, 2.25, 2.75, 3.5];
const CALENDAR_ZOOM_DEFAULT = 1;
const BASE_NEXT_CHOICE_IDS = {
  morning: {
    disruption: 6
  },
  night: {
    interaction: 6,
    hobbies: 5,
    intentioncheck: 5,
    exercise: 6
  }
};

/* --- Question types ---------------------------------------------------------

   Every question this survey engine can render, whether it came from SCHEMA or
   was added by hand in the form's edit mode. The registry is the single place a
   type is described; `appendSurveyControl()` dispatches on `key` and everything
   else -- the add-question picker, the Settings toggles, the export formatter --
   reads this list rather than carrying its own copy.

   `tier` decides where a type can be used:
     "standard"  offered in the add-question picker straight away
     "optional"  hidden until switched on in Settings → Survey question types
     "builtin"   renders, but is bound to a data source outside the survey
                 (the goal log), so it can never be a new question

   `stores` documents the shape of the saved answer, because the rest of the app
   -- markdown export, the goal evidence sweep, `surveyAnswerIsReal()` -- reads
   these strings back:
     "text"   a plain string
     "list"   comma-joined values, like `multi`
     "pairs"  "Label: value; Label: value", like `form` and `slider`
     "media"  an object { text, image?, files? }
     "none"   the question holds no answer at all
--------------------------------------------------------------------------- */

const QUESTION_TYPES = [
  {
    key: "text",
    label: "Text",
    tier: "standard",
    stores: "text",
    description: "A free-text box. The default for anything written out longhand.",
    config: []
  },
  {
    key: "number",
    label: "Number",
    tier: "standard",
    stores: "text",
    description: "A single numeric answer.",
    config: []
  },
  {
    key: "single",
    label: "Multiple choice — one answer",
    tier: "standard",
    stores: "text",
    description: "Radio buttons. Exactly one option.",
    config: ["choices"]
  },
  {
    key: "multi",
    label: "Multiple choice — multi-select",
    tier: "standard",
    stores: "list",
    description: "Checkboxes. Any number of options, saved comma-joined.",
    config: ["choices"]
  },
  {
    key: "form",
    label: "Form — several text fields",
    tier: "standard",
    stores: "pairs",
    description: "A labelled grid of text boxes. Fields named \"Time I …\" get a clock picker.",
    config: ["fields"]
  },
  {
    key: "slider",
    label: "Slider block",
    tier: "standard",
    stores: "pairs",
    description: "One slider per field, all sharing a scale.",
    config: ["fields", "scale"]
  },
  {
    key: "matrix",
    label: "Matrix table",
    tier: "standard",
    stores: "pairs",
    description: "A grid: every row answered on the same set of columns. One column per row.",
    config: ["fields", "choices"]
  },
  {
    key: "rankOrder",
    label: "Rank order",
    tier: "standard",
    stores: "pairs",
    description: "Put the options in order. Saved as \"Option: rank\".",
    config: ["choices"]
  },
  {
    key: "fileUpload",
    label: "File upload",
    tier: "standard",
    stores: "media",
    description: "Attach one or more files to the answer.",
    config: []
  },
  {
    key: "audio",
    label: "Audio response",
    tier: "standard",
    stores: "media",
    description: "Record straight into the survey, or attach an audio file.",
    config: []
  },
  {
    key: "textImage",
    label: "Text with a picture",
    tier: "standard",
    stores: "media",
    description: "A written answer plus one optional photo.",
    config: []
  },
  {
    key: "constantSum",
    label: "Constant sum",
    tier: "optional",
    stores: "pairs",
    description: "Split a fixed total across the options — hours in a day, 100 points.",
    config: ["choices", "total"]
  },
  {
    key: "nps",
    label: "Net Promoter Score",
    tier: "optional",
    stores: "text",
    description: "The 0–10 scale with detractor / passive / promoter anchors.",
    config: []
  },
  {
    key: "drillDown",
    label: "Drill down",
    tier: "optional",
    stores: "text",
    description: "Cascading menus — pick a category, then narrow it down.",
    config: ["tree"]
  },
  {
    key: "signature",
    label: "Signature",
    tier: "optional",
    stores: "media",
    description: "Draw with the mouse or a finger. Saved as a picture.",
    config: []
  },
  {
    key: "pickGroupRank",
    label: "Pick, group and rank",
    tier: "optional",
    stores: "pairs",
    description: "Drag options into groups, then order them inside each group.",
    config: ["choices", "groups"]
  },
  {
    key: "descriptive",
    label: "Descriptive text or graphic",
    tier: "optional",
    stores: "none",
    description: "Not a question — a heading, a note, or an image between questions.",
    config: ["body"]
  },
  {
    key: "hotSpot",
    label: "Hot spot",
    tier: "optional",
    stores: "list",
    description: "Click named regions of a picture.",
    config: ["image", "regions"]
  },
  {
    key: "heatMap",
    label: "Heat map",
    tier: "optional",
    stores: "list",
    description: "Click anywhere on a picture; the coordinates are what gets saved.",
    config: ["image"]
  },
  {
    key: "sideBySide",
    label: "Side by side",
    tier: "optional",
    stores: "pairs",
    description: "Several matrix columns sharing one set of rows.",
    config: ["fields", "columns"]
  },
  {
    key: "tree",
    label: "Tree select",
    tier: "optional",
    stores: "list",
    description: "Nested, collapsible categories. Tick at any level.",
    config: ["tree"]
  },
  {
    key: "video",
    label: "Video response",
    tier: "optional",
    stores: "media",
    description: "Record from the webcam, or attach a video file.",
    config: []
  },
  {
    key: "highlighter",
    label: "Highlighter",
    tier: "optional",
    stores: "list",
    description: "Highlight parts of a passage. The highlighted text is the answer.",
    config: ["body"]
  },
  {
    key: "ruleRatings",
    label: "Rule of the day ratings",
    tier: "builtin",
    stores: "pairs",
    description: "Mirrors the goal log's rule rows for this date.",
    config: []
  },
  {
    key: "dailyGoals",
    label: "Daily goals",
    tier: "builtin",
    stores: "pairs",
    description: "Mirrors the goal log's daily habit rows for this date.",
    config: []
  }
];

const QUESTION_TYPE_BY_KEY = new Map(QUESTION_TYPES.map((type) => [type.key, type]));
// Optional types start off. Switching one on in Settings only adds it to the
// add-question picker; a question already using it keeps rendering either way,
// so turning a type off can never blank an answer already given.
let enabledQuestionTypes = Object.fromEntries(
  QUESTION_TYPES.filter((type) => type.tier === "optional").map((type) => [type.key, false])
);

function questionType(key) {
  return QUESTION_TYPE_BY_KEY.get(key) || null;
}

function questionTypeLabel(key) {
  return questionType(key)?.label || key;
}

function isQuestionTypeEnabled(key) {
  const type = questionType(key);
  if (!type) return false;
  if (type.tier === "standard") return true;
  if (type.tier === "builtin") return false;
  return enabledQuestionTypes[key] === true;
}

// What the "Add a question" picker offers: the standard set plus whatever has
// been switched on in Settings. Never the builtins.
function addableQuestionTypes() {
  return QUESTION_TYPES.filter((type) => isQuestionTypeEnabled(type.key));
}

function questionTypeStores(key) {
  return questionType(key)?.stores || "text";
}

const els = {};
let state = loadState();
let activeTab = "survey";
let activeView = "document";
let taskFilter = "all";
let taskDragState = null;
let taskHistoryOpen = false;
let surveyEditMode = false;
// The real calendar, shown as a column to the right of the survey form.
// Open/closed is persisted through appSettings() -- whether you want the day in
// front of you while answering is a standing preference, not a per-visit one.
// The column IS the calendar view (same element, same controls, editable), so
// it shares `calendarKindFilter` and the rest of the calendar's state.
let surveyCalendarOpen = true;
// The column follows the survey's day, but only re-pins when the day changes or
// the survey is re-entered, so paging it to a neighbouring day for reference
// survives answering the next question.
let surveyCalendarPinnedDate = null;
// The move/copy tool folds away until asked for: it is used on the days a
// survey went onto the wrong date, not on the days it did not.
let surveyTransferOpen = false;
let surveyTransferDirection = "to";
let surveyTransferDate = "";
// The last move or copy, kept only so it can be undone from the panel. The
// app-wide undo stack restores state in memory but only writes the *current*
// entry back to disk, which would leave the other day of a cross-day move
// stale on disk until something else touched it.
let lastSurveyTransfer = null;
let taskHistoryNewestFirst = true;
let mistakesRenderPending = false;
const removedMistakeIds = new Set();
let mistakesReviewOpen = false;
let mistakesReviewQuery = "";
// The nav buttons for the standing lists (Mistakes, Learn, Shopping)
// hide behind the Lists toggle. Presentation only, like the mobile "more"
// toggle: not persisted, so every load starts folded unless a list view is
// the one being restored.
const LIST_NAV_VIEWS = ["mistakes", "learn", "shopping", "people"];
let listsNavOpen = false;
let taskSyncTimer = null;
let taskSyncPausedUntil = 0;
let lastKnownActualDate = todayISO();
const TASK_SYNC_DEFER_MS = 4000;
let calendarMode = "week";
let calendarCursorDate = todayISO();
let editingCalendarEventId = null;
let editingCalendarOccurrenceDate = null;
let calendarDraftDate = todayISO();
let calendarDraftEvent = null;
let calendarPersistentDraftPreview = null;
let calendarKindFilter = "both";
// Whether FYI/tentative plan events (office hours, drop-ins) are drawn at all.
// A view preference like zoom, so it persists in settings but stays out of the
// app undo history.
let calendarShowTentative = true;
/* Which clock the grid is drawn in. "lived" is the default and the honest one:
   every day is shown in the zone that was on the wall that day, so looking back
   at March in Taipei shows Taipei mornings even from Bangkok. "device" follows
   the laptop, and an IANA name pins the whole view to one zone.

   Only pegged events answer to this -- a floating block is a wall-clock promise
   and never moves, which is why "lived" costs nothing to render: the stored
   clocks are already the lived ones. */
let calendarViewZoneMode = "lived";
let calendarZoom = CALENDAR_ZOOM_DEFAULT;
let calendarDragSelection = null;
// The task currently held on the cursor, waiting for a click on the grid to say
// what time it happens. See "Placing a task on the calendar".
let taskPlacement = null;
let calendarResizeState = null;
let calendarEventMoveState = null;
let calendarSuppressEventClickId = null;
// Armed when the calendar view is opened (and by "jump to today"); consumed by
// the next visible render, which scrolls the grid to the lived part of the day
// instead of leaving it parked at midnight.
let calendarNeedsAutoScroll = true;
// The one old plan currently swapped in over the current one for a look, keyed
// by its supersededAt stamp. In-memory only: a reload puts every old plan away.
let calendarExpandedOldPlanStamp = null;
// Set by clicking the "Unassigned" counter in the footer. The counter states a
// number of hours with nothing to point at, which is the one thing it cannot
// answer on its own -- while this is on, the sessions it is counting are the
// only ones drawn at full strength.
let calendarReminderTimer = null;
let nightSurveyReminderTimer = null;
const shownNightSurveyReminderKeys = new Set();
let calendarNowLineTimer = null;
let googleCalendarStatus = null;
let googleCalendarSyncing = false;
let googleCalendarPollTimer = null;
let outlookCalendarStatus = null;
let spotifyStatus = null;
let spotifySyncing = false;
let spotifyPollTimer = null;
let outlookCalendarSyncing = false;
let outlookCalendarPollTimer = null;
let desktopCalendarNotifications = false;
// True from the moment this tab's toggle changes the alerts setting until the
// change reaches disk. Any other time, the tab's copy of the setting is only a
// reading and is re-read before it is written back (see saveSettingsToDisk).
let desktopCalendarNotificationsOwned = false;
// The columns of the running "lessons from experience" log. Order matters: it
// is the column order in the Lessons view, the TSV copy and the markdown
// export. Adding a column here is enough -- the view, exports and the Missing
// tab all read this list. The log started life as a mistakes-only log, which is
// why the storage keys (entry.mistakes, "problem") and most function names
// still say "mistake": renaming them would mean rewriting every entry on disk.
// Since 2026-09-10 a row is neutral -- a good decision or a bad one, marked by
// its `outcome` -- so the labels are written to read either way.
// "alternative" sits straight after "why" on purpose: it is the counterweight to
// the self-blaming (or self-congratulating) explanation, and the action column
// stays last.
const MISTAKE_COLUMNS = [
  { key: "what", label: "What I did", placeholder: "What I did" },
  { key: "problem", label: "What it led to", placeholder: "What came of it, good or bad" },
  { key: "why", label: "Why I think I did it", placeholder: "Why I think I did it" },
  { key: "alternative", label: "Alternative explanation", placeholder: "Context outside my control, or reasons the outcome wasn't really down to me" },
  { key: "nextTime", label: "What I can do next time", placeholder: "What to repeat, or what to do differently" }
];
// How the decision turned out. "" is a row that has been captured but not yet
// judged, which is a valid state: deciding whether something was a good call
// is reflection, and capture must never wait on it. Rows from before the log
// went neutral carry no outcome at all and are read as "bad" (see
// normalizeMistake), because every one of them was logged as a mistake.
const MISTAKE_OUTCOMES = [
  { key: "good", label: "Went well", short: "Good call" },
  { key: "bad", label: "Went badly", short: "Bad call" }
];
function mistakeOutcomeLabel(outcome, field = "short") {
  return MISTAKE_OUTCOMES.find((item) => item.key === outcome)?.[field] || "";
}
// Tags are deliberately NOT a MISTAKE_COLUMNS entry. Columns are prose fields
// that mistakeIsComplete() requires, and a row must never be marked unfinished
// for lacking a tag -- capture stays one field, and everything after it is
// optional. They also only ever appear on the card in the Lessons view, never
// in the Ctrl+Alt+W window: naming the pattern is reflection, and asking for it
// mid-mistake is what killed this log the last time it was kept.
//
// The vocabulary starts empty on purpose. Any tag typed on a row joins the
// picker for every later row (mistakeTagVocabulary()), so the set grows into
// the patterns that turn out to be real for you rather than ones guessed here.
const MISTAKE_TAGS = [];
// Completion animations played by the Windows task HUD (task-hud.ps1), which
// reads the enabled set straight out of app-settings.json.
const CELEBRATION_KINDS = [
  { key: "confetti", label: "Confetti", description: "Classic falling confetti with a burst off the checkmark." },
  { key: "fire", label: "Fire", description: "Flames climb the screen with embers and an ON FIRE callout." },
  { key: "letsgo", label: "Let's go", description: "Yelling yellow ball with impact lines and the shoutout." },
  { key: "bowling", label: "Bowling strike", description: "Ball rolls in and scatters a full rack of pins." },
  { key: "fireworks", label: "Fireworks", description: "Staggered bursts that launch and rain down." },
  { key: "coins", label: "Coins", description: "Gold coins erupt off the checkmark and spin as they fall." }
];
let celebrations = Object.fromEntries(CELEBRATION_KINDS.map((kind) => [kind.key, true]));
const shownCalendarReminderKeys = new Set();
// Each snapshot is a full stringified copy of state, so the old limit of 80 could
// retain tens of megabytes of strings for a journal app. Undo here is a coarse
// "put that back" across views, not per-keystroke text undo -- the document
// editor has its own -- so the depth was never the point.
const APP_HISTORY_LIMIT = 20;
let appUndoStack = [];
let appRedoStack = [];
let applyingAppHistory = false;

document.addEventListener("DOMContentLoaded", async () => {
  blockZhongwenDictionary();
  bindElements();
  wireEvents();
  setupKeyboardWatcher();
  await initializeDateAndSession();
  // If the restored view is one of the folded list views, unfold the group so
  // the highlighted button is visible from the first paint.
  setListsNavOpen(LIST_NAV_VIEWS.includes(activeView));
  startAppSessionLog();
  render();
});

/* iOS never resizes the layout viewport for the software keyboard — only the
   visual viewport shrinks — so the phone layout's fixed bottom tab bar would
   sit behind the keyboard, or float mid-screen once iOS pans the page to the
   focused field. Native apps hide the tab bar behind the keyboard, and
   body.keyboard-open lets the CSS do the same. The --vv-* vars exist because
   position:fixed anchors to the layout viewport, which iOS pans freely while
   the keyboard is up: anything that must stay on screen (the doc-toolbar
   bottom sheets) positions off these instead. The 120px floor keeps browser
   chrome show/hide from reading as a keyboard. Presentation only — nothing
   here touches entry state. */
function setupKeyboardWatcher() {
  const vv = window.visualViewport;
  if (!vv) return;
  const update = () => {
    const keyboardOpen = window.innerHeight - vv.height > 120;
    document.body.classList.toggle("keyboard-open", keyboardOpen);
    const root = document.documentElement;
    root.style.setProperty("--vv-top", `${Math.round(vv.offsetTop)}px`);
    root.style.setProperty("--vv-height", `${Math.round(vv.height)}px`);
  };
  vv.addEventListener("resize", update);
  vv.addEventListener("scroll", update);
  update();
}

// Mirrors the HUD's hud-log.json. app-settings.json only ever holds the *last*
// activeView, so nothing recorded when the app was open or where the time inside
// it went. One session per page load; a reload is a new session.
const appSessionId =
  window.crypto?.randomUUID?.() || `app-${Date.now()}-${Math.random().toString(16).slice(2)}`;
let appSessionStartedAt = null;
let appSessionEnded = false;

function logAppEvent(kind, extra = {}) {
  const payload = JSON.stringify({
    date: state.currentDate || todayISO(),
    kind,
    sessionId: appSessionId,
    ...extra
  });
  // The unload path cannot await a fetch, so "end" goes out through sendBeacon.
  // Everything else is a normal fire-and-forget POST; a failed log must never
  // surface to the user or block a view switch.
  if (kind === "end" && navigator.sendBeacon) {
    try {
      navigator.sendBeacon("/api/app-log", new Blob([payload], { type: "application/json" }));
      return;
    } catch {
      // Fall through to fetch.
    }
  }
  fetch("/api/app-log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: kind === "end"
  }).catch(() => undefined);
}

function endAppSession() {
  // pagehide and visibilitychange both fire on the way out, and a backgrounded
  // tab can be resurrected; guard so one session writes at most one "end".
  if (appSessionEnded || !appSessionStartedAt) return;
  appSessionEnded = true;
  logAppEvent("end", {
    view: activeView,
    durationSeconds: (Date.now() - appSessionStartedAt) / 1000
  });
}

function startAppSessionLog() {
  appSessionStartedAt = Date.now();
  logAppEvent("start", { view: activeView });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") logAppEvent("hidden", { view: activeView });
    else logAppEvent("visible", { view: activeView });
  });
  window.addEventListener("pagehide", endAppSession);
}

function bindElements() {
  for (const id of [
    "todayLine",
    "dateInput",
    "backDayButton",
    "todayButton",
    "forwardDayButton",
    "sunButton",
    "moonButton",
    "settingsViewButton",
    "trendsViewButton",
    "mobileMoreButton",
    "accentColorInput",
    "bgColorInput",
    "panelColorInput",
    "resetColorsButton",
    "leftResizeHandle",
    "rightResizeHandle",
    "documentViewButton",
    "tasksViewButton",
    "calendarViewButton",
    "listsNavToggle",
    "listsNavGroup",
    "mistakesViewButton",
    "learnViewButton",
    "shoppingViewButton",
    "peopleViewButton",
    "morningSurveyViewButton",
    "nightSurveyViewButton",
    "guideTitle",
    "checklist",
    "searchInput",
    "searchResults",
    "editorTitle",
    "saveStatus",
    "processButton",
    "saveButton",
    "workArea",
    "documentEditor",
    "docToolbar",
    "journalDoc",
    "tasksView",
    "calendarView",
    "mistakesView",
    "learnView",
    "shoppingView",
    "peopleView",
    "settingsView",
    "trendsView",
    "reviewView",
    "formView",
    "outputPanel",
    "toggleOutputPanelButton",
    "miniRow",
    "miniRowStatus",
    "exportMenu",
    "copyDocumentButton",
    "copyWorkbookButton",
    "copySurveyButton",
    "surveyOutput",
    "hoursOutput",
    "journalOutput",
    "completedOutput",
    "mistakesOutput",
    "missingOutput",
    "weekOutput"
  ]) {
    els[id] = document.getElementById(id);
  }
}

function wireEvents() {
  els.dateInput.addEventListener("change", () => {
    syncDocumentText();
    state.currentDate = els.dateInput.value || todayISO();
    ensureEntry(state.currentDate);
    saveLocal();
    render();
  });
  els.backDayButton.addEventListener("click", () => shiftDate(-1));
  els.todayButton.addEventListener("click", goToToday);
  els.forwardDayButton.addEventListener("click", () => shiftDate(1));
  els.sunButton.addEventListener("click", () => setTheme("morning"));
  els.moonButton.addEventListener("click", () => setTheme("night"));
  els.settingsViewButton.addEventListener("click", () => setView("settings"));
  els.trendsViewButton.addEventListener("click", () => setView("trends"));
  els.mobileMoreButton.addEventListener("click", toggleMobileMore);
  els.accentColorInput.addEventListener("input", () => setColorOverride("accent", els.accentColorInput.value));
  els.bgColorInput.addEventListener("input", () => setColorOverride("bg", els.bgColorInput.value));
  els.panelColorInput.addEventListener("input", () => setColorOverride("panel", els.panelColorInput.value));
  els.resetColorsButton.addEventListener("click", resetColorOverrides);
  els.documentViewButton.addEventListener("click", () => setView("document"));
  els.tasksViewButton.addEventListener("click", () => setView("tasks"));
  els.calendarViewButton.addEventListener("click", () => setView("calendar"));
  els.listsNavToggle.addEventListener("click", () => setListsNavOpen(!listsNavOpen));
  els.mistakesViewButton.addEventListener("click", () => setView("mistakes"));
  els.learnViewButton.addEventListener("click", () => setView("learn"));
  els.shoppingViewButton.addEventListener("click", () => setView("shopping"));
  els.peopleViewButton.addEventListener("click", () => setView("people"));
  els.morningSurveyViewButton.addEventListener("click", () => {
    setSession("morning", { keepView: true });
    setView("survey");
  });
  els.nightSurveyViewButton.addEventListener("click", () => {
    setSession("night", { keepView: true });
    setView("survey");
  });
  wireDocumentEditor();
  // Offline recovery: the moment connectivity returns (or the tab is looked at
  // again), replay queued goal events and re-send entry saves that failed.
  window.addEventListener("online", () => {
    flushGoalEventQueue();
    retryOfflineEntrySaves();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    flushGoalEventQueue();
    retryOfflineEntrySaves();
  });
  // The Journal tab's infinite scroll into earlier days. The panel element
  // persists across renders (only its children are replaced), so one listener.
  els.journalOutput.addEventListener("scroll", handleJournalReaderScroll);
  els.searchInput.addEventListener("input", renderSearchResults);
  els.processButton.addEventListener("click", () => {
    processCurrentEntry();
    saveEverywhere();
    renderOutputs();
  });
  els.saveButton.addEventListener("click", saveEverywhere);
  els.toggleOutputPanelButton.addEventListener("click", toggleOutputPanel);
  els.copyDocumentButton.addEventListener("click", copyDocumentToClipboard);
  els.copyWorkbookButton.addEventListener("click", () => copyText(buildWorkbookTSV()));
  els.copySurveyButton.addEventListener("click", () => copyText(buildSurveyDraftText()));
  // Picking anything from either footer menu closes it, and so does clicking
  // away -- a <details> left hanging open covers the footer of every view.
  for (const menu of [els.exportMenu]) {
    menu.addEventListener("click", (event) => {
      if (event.target.closest(".export-menu-panel button")) menu.open = false;
    });
    document.addEventListener("pointerdown", (event) => {
      if (menu.open && !menu.contains(event.target)) menu.open = false;
    });
  }
  document.addEventListener("keydown", handleGlobalUndo);
  document.addEventListener("pointerdown", handleCalendarEditorOutsidePointer, true);
  els.calendarView.addEventListener("wheel", handleCalendarWheelZoom, { passive: false });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushSave();
    if (document.visibilityState === "visible") {
      syncTasksFromDisk();
      updateCalendarNowLines();
      refreshCoverageChips();
    }
    applyTaskSyncCadence();
  });
  window.addEventListener("beforeunload", flushSave);
  window.addEventListener("pagehide", flushSave);
  wireResizeHandles();
  document.querySelectorAll(".tabs button").forEach((button) => {
    button.addEventListener("click", () => {
      activeTab = button.dataset.tab;
      saveLocal();
      renderTabs();
    });
  });
}

async function initializeDateAndSession() {
  state.currentDate = todayISO();
  state.session = state.session || inferTheme();
  state.theme = state.theme || inferTheme();
  ensureColorState();
  ensureCustomChoiceState();
  ensureCalendarState();
  migrateEntryCustomChoices();
  ensureEntry(state.currentDate);
  applyPaneSizes();
  await loadSettingsFromDisk({ renderAfter: false });
  // Awaited before the rest rather than raced alongside them: pegged events
  // re-localise against the timeline, and a calendar that arrived first would
  // render once in the wrong zone and correct itself a moment later.
  await loadTimezoneHistoryFromDisk();
  await Promise.all([
    loadCustomChoicesFromDisk(),
    loadEntriesFromDisk(),
    loadCalendarEventsFromDisk(),
    loadGoogleCalendarStatus(),
    loadOutlookCalendarStatus(),
    loadSpotifyStatus(),
    loadGoalsFromDisk(),
    loadGoalLogFromDisk(),
    loadLearnListFromDisk(),
    loadShoppingListFromDisk(),
    loadPeopleFromDisk()
  ]);
  ensurePeopleSeeded();
  ensureRuleScheduleAhead(state.currentDate);
  ensureZoneDividersForDate(state.currentDate);
  flushGoalEventQueue();
  refreshDailyGoalTasks();
  startCalendarReminders();
  startNightSurveyReminders();
  startCalendarNowLineUpdates();
  startTaskSync();
  resetAppHistory();
}

function setSession(session, options = {}) {
  syncDocumentText();
  state.session = session;
  ensureEntry(state.currentDate);
  if (!options.keepView && activeView === "survey") activeView = "document";
  saveLocal();
  render();
}

function setTheme(theme) {
  syncDocumentText();
  state.theme = theme;
  ensureColorState();
  saveLocal();
  render();
}

function setListsNavOpen(open) {
  listsNavOpen = Boolean(open);
  els.listsNavGroup.classList.toggle("hidden", !listsNavOpen);
  els.listsNavToggle.setAttribute("aria-expanded", String(listsNavOpen));
  const label = listsNavOpen ? "Hide lists" : "Show lists";
  els.listsNavToggle.title = label;
  // When the group is folded while a list view is showing, the toggle carries
  // the active highlight so the nav still says where you are.
  els.listsNavToggle.classList.toggle("active", LIST_NAV_VIEWS.includes(activeView) && !listsNavOpen);
}

function setView(view) {
  syncDocumentText();
  if (view !== activeView) logAppEvent("view", { view });
  if (view === "calendar" && view !== activeView) calendarNeedsAutoScroll = true;
  activeView = view;
  saveLocal();
  render();
  // Settings is now the only place calendar connections are configured, so pull
  // fresh connection status whenever it opens.
  if (view === "settings") {
    loadGoogleCalendarStatus({ render: true });
    loadOutlookCalendarStatus({ render: true });
  }
}

function inferTheme() {
  return new Date().getHours() < 14 ? "morning" : "night";
}

function shiftDate(days) {
  syncDocumentText();
  const date = new Date(`${state.currentDate || todayISO()}T12:00:00`);
  date.setDate(date.getDate() + days);
  const offset = date.getTimezoneOffset();
  state.currentDate = new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
  ensureEntry(state.currentDate);
  ensureZoneDividersForDate(state.currentDate);
  saveLocal();
  render();
}

function goToToday() {
  syncDocumentText();
  state.currentDate = todayISO();
  ensureEntry(state.currentDate);
  ensureZoneDividersForDate(state.currentDate);
  saveLocal();
  render();
}

function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

/* --- Time zones -------------------------------------------------------------

   The whole app writes wall clock: "2026-08-14T09:00" means nine in the morning
   wherever you were standing, and that is the right default -- a morning routine
   is at seven whatever country it happens in. What wall clock cannot do is
   arithmetic across a move. Nine in Taipei and nine in Bangkok are an hour
   apart, so any duration, total or "which day was that" question asked across a
   zone change has to go through an *instant* to come out right.

   These are the only conversions in the app, and everything downstream -- pegged
   events, the transition log, real-hours accounting -- is built from them. They
   are mirrored verbatim in server.cjs; change one, change the other.

   Node and every browser here ship full ICU, so Intl is the source of truth for
   offsets rather than a hand-kept table: it knows historical DST, it knows that
   Asia/Taipei has not observed it since 1979, and it will keep knowing after the
   next time some legislature moves a clock.
--------------------------------------------------------------------------- */

const ZONE_WALL_CLOCK_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const zoneOffsetFormatters = new Map();

function isValidTimeZone(zone) {
  const name = String(zone || "").trim();
  if (!name) return false;
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: name });
    return true;
  } catch {
    return false;
  }
}

function currentTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function zoneOffsetFormatter(zone) {
  let formatter = zoneOffsetFormatters.get(zone);
  if (!formatter) {
    // en-CA with h23 is the combination that formats as plain YYYY-MM-DD, 00-23
    // in every runtime here, which is what makes the parts safe to read back by
    // name without a locale-shaped surprise at midnight.
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: zone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    zoneOffsetFormatters.set(zone, formatter);
  }
  return formatter;
}

// Minutes east of UTC for `zone` at instant `ms` -- +480 for Taipei, -240 for
// New York in summer. Asking at an instant rather than for the zone as a whole
// is the point: a zone's offset is a function of when, not just where.
function zoneOffsetMinutes(zone, ms = Date.now()) {
  if (!isValidTimeZone(zone)) return -new Date(ms).getTimezoneOffset();
  const parts = {};
  for (const part of zoneOffsetFormatter(zone).formatToParts(new Date(ms))) parts[part.type] = part.value;
  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second)
  );
  return Math.round((asUTC - ms) / 60000);
}

/* Wall clock -> instant, the direction that has no exact answer.

   A local time is not always one instant: the hour a DST spring-forward skips
   never happened, and the hour a fall-back repeats happened twice. Two passes is
   the standard fix -- guess the offset at the naive instant, correct with the
   offset actually in force there -- and it lands on the right side of every
   ordinary boundary, picking the first pass through an ambiguous hour.

   A time inside a gap has no instant at all, and the two-pass result quietly
   lands *before* it -- 02:30 on a spring-forward morning coming back as 01:30,
   an event moving backwards for no reason the reader can see. Round-tripping
   catches exactly that case (the clock we get back is not the clock we asked
   for), and the first-pass guess is the conventional answer there: shift forward
   by the gap, so 02:30 becomes 03:30 and the event keeps its place in the day. */
function zoneWallClockToInstant(wall, zone) {
  const text = String(wall || "").trim();
  if (!ZONE_WALL_CLOCK_PATTERN.test(text)) return NaN;
  const naive = Date.UTC(
    Number(text.slice(0, 4)),
    Number(text.slice(5, 7)) - 1,
    Number(text.slice(8, 10)),
    Number(text.slice(11, 13)),
    Number(text.slice(14, 16))
  );
  if (!isValidTimeZone(zone)) return naive + new Date(naive).getTimezoneOffset() * 60000;
  const guess = naive - zoneOffsetMinutes(zone, naive) * 60000;
  const settled = naive - zoneOffsetMinutes(zone, guess) * 60000;
  return instantToZoneWallClock(settled, zone) === text ? settled : guess;
}

// Instant -> wall clock, the direction that is always exact.
function instantToZoneWallClock(ms, zone) {
  if (!Number.isFinite(ms)) return "";
  const offset = isValidTimeZone(zone) ? zoneOffsetMinutes(zone, ms) : -new Date(ms).getTimezoneOffset();
  return new Date(ms + offset * 60000).toISOString().slice(0, 16);
}

// The composition of the two, which is what re-localising a pegged event is.
function convertZoneWallClock(wall, fromZone, toZone) {
  const text = String(wall || "").trim();
  if (!ZONE_WALL_CLOCK_PATTERN.test(text)) return text;
  if (!fromZone || !toZone || fromZone === toZone) return text;
  if (!isValidTimeZone(fromZone) || !isValidTimeZone(toZone)) return text;
  return instantToZoneWallClock(zoneWallClockToInstant(text, fromZone), toZone);
}

function zoneOffsetLabel(minutes) {
  if (!Number.isFinite(minutes)) return "";
  const sign = minutes < 0 ? "-" : "+";
  const total = Math.abs(Math.round(minutes));
  return `GMT${sign}${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

// "Asia/Ho_Chi_Minh" reads as a file path; the city is the part a person thinks
// in. Zones with no city part (UTC) keep their own name.
function zoneCityLabel(zone) {
  const name = String(zone || "").trim();
  if (!name) return "";
  const tail = name.includes("/") ? name.slice(name.lastIndexOf("/") + 1) : name;
  return tail.replace(/_/g, " ");
}

/* --- The transition log and the timeline it describes ------------------------

   timezone-history.json holds one row per zone change, each pinned to an
   instant; see the note in server.cjs for why a row is a moment and not a date.
   What this half adds is the reading of it: turning a handful of rows into the
   timeline the calendar, the hour grid and every total are drawn against.

   The idea worth holding on to is that there are two different clocks in play.
   Instants are continuous and never repeat; local dates are a *labelling* of
   them that a move can tear. Fly Bangkok -> New York and the label "2026-08-20"
   gets stuck on 35 hours of real time; fly the other way and it covers 13. So
   "what happened on the 20th" cannot be answered by a 24-hour box -- it is
   answered by asking which stretches of the real timeline were wearing that
   date, which is exactly what dateZoneSegments() returns.

   Every honest number downstream falls out of those segments: the day's real
   length is their total, the hour grid draws one strip per segment, and a date
   with no segments at all is a date that never happened.
--------------------------------------------------------------------------- */

const ZONE_TRANSITION_SOURCES = new Set(["event", "manual", "seed", "device"]);
// A day this short was not lived enough to judge a habit or a goal against.
// Whole dates vanish only across the date line, but a big eastward move can
// leave a date with four waking hours in it, which is the same problem.
const ZONE_SHORT_DAY_MINUTES = 6 * 60;

let zoneTransitions = [];
// Same lesson as calendarEventsLoaded: an empty list means "no moves recorded"
// and "the server has not answered yet", and only one of those may be saved back.
let zoneTransitionsLoaded = false;
let deviceZoneSuggestion = null;
// Bumped on every change to the log so the memo below knows to forget.
let zoneTimelineVersion = 0;
let zoneTimelineCache = null;
const zoneSegmentCache = new Map();

function zoneTransitionId() {
  return `tz-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

// Mirror of normalizeZoneTransition in server.cjs, including deriving atInstant
// from the wall clock rather than trusting the stored one.
function normalizeZoneTransition(raw) {
  if (!raw || typeof raw !== "object") return null;
  const from = String(raw.from || "").trim();
  const to = String(raw.to || "").trim();
  if (!isValidTimeZone(from) || !isValidTimeZone(to) || from === to) return null;
  const at = normalizeCalendarDateTime(raw.at);
  if (!at) return null;
  const instant = zoneWallClockToInstant(at, from);
  if (!Number.isFinite(instant)) return null;
  return {
    id: String(raw.id || zoneTransitionId()),
    from,
    to,
    at,
    atInstant: new Date(instant).toISOString(),
    eventId: String(raw.eventId || "").trim(),
    source: ZONE_TRANSITION_SOURCES.has(raw.source) ? raw.source : "manual",
    approximate: Boolean(raw.approximate),
    note: String(raw.note || "").trim(),
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString()
  };
}

function normalizeZoneTransitions(input) {
  const rows = (Array.isArray(input) ? input : []).map(normalizeZoneTransition).filter(Boolean);
  const byEvent = new Map();
  for (const row of rows) if (row.eventId) byEvent.set(row.eventId, row);
  const seen = new Set();
  const kept = [];
  for (const row of rows) {
    if (row.eventId) {
      if (seen.has(row.eventId) || byEvent.get(row.eventId) !== row) continue;
      seen.add(row.eventId);
    }
    kept.push(row);
  }
  return kept.sort((a, b) => (a.atInstant === b.atInstant ? a.id.localeCompare(b.id) : a.atInstant.localeCompare(b.atInstant)));
}

function setZoneTransitions(rows) {
  zoneTransitions = normalizeZoneTransitions(rows);
  zoneTimelineVersion += 1;
  zoneTimelineCache = null;
  zoneSegmentCache.clear();
  return zoneTransitions;
}

async function loadTimezoneHistoryFromDisk() {
  try {
    const response = await fetch("/api/timezone-history");
    if (!response.ok) return;
    const data = await response.json();
    setZoneTransitions(data.transitions || []);
    zoneTransitionsLoaded = true;
    deviceZoneSuggestion = data.suggestion || null;
    if (activeView === "calendar") renderCalendarView();
  } catch {
    // No log means the timeline is a single piece in the device zone, which is
    // exactly how the app behaved before any of this existed.
  }
}

async function saveTimezoneHistory() {
  if (!zoneTransitionsLoaded) return false;
  try {
    const response = await fetch("/api/timezone-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transitions: zoneTransitions })
    });
    if (!response.ok) return false;
    const data = await response.json();
    setZoneTransitions(data.transitions || zoneTransitions);
    return true;
  } catch {
    return false;
  }
}

/* The instant timeline: one piece per stretch of real time spent in one zone,
   the first running back to the beginning of time and the last forward to the
   end of it, so every instant the app can ask about lands inside exactly one. */
function zoneTimeline() {
  if (zoneTimelineCache) return zoneTimelineCache;
  const fallback = currentTimeZone();
  const pieces = [];
  let zone = zoneTransitions.length ? zoneTransitions[0].from : fallback;
  let from = -Infinity;
  let enteredBy = null;
  for (const row of zoneTransitions) {
    const at = Date.parse(row.atInstant);
    if (!Number.isFinite(at)) continue;
    pieces.push({ zone, from, to: at, enteredBy, leftBy: row });
    zone = row.to;
    from = at;
    enteredBy = row;
  }
  pieces.push({ zone, from, to: Infinity, enteredBy, leftBy: null });
  zoneTimelineCache = pieces;
  return pieces;
}

function zoneAtInstant(ms) {
  const fallback = currentTimeZone();
  if (!Number.isFinite(ms)) return fallback;
  for (const piece of zoneTimeline()) if (ms >= piece.from && ms < piece.to) return piece.zone;
  return fallback;
}

/* Which stretches of real time wore this date, in the order they were lived.

   On an ordinary day this is one segment, 00:00 to 24:00, and everything that
   reads it can carry on as though nothing had changed. On a travel day it is
   two, and they can overlap (the westward move that gives back an afternoon) or
   leave a hole (the eastward one that takes a morning away). On the day you
   cross the date line eastward it is empty: the date was never worn at all. */
function dateZoneSegments(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))) return [];
  const key = `${zoneTimelineVersion}|${date}`;
  const cached = zoneSegmentCache.get(key);
  if (cached) return cached;
  const next = shiftISODate(date, 1);
  const segments = [];
  for (const piece of zoneTimeline()) {
    const dayStart = zoneWallClockToInstant(`${date}T00:00`, piece.zone);
    const dayEnd = zoneWallClockToInstant(`${next}T00:00`, piece.zone);
    const start = Math.max(piece.from, dayStart);
    const end = Math.min(piece.to, dayEnd);
    if (!(end > start)) continue;
    segments.push({
      zone: piece.zone,
      startInstant: start,
      endInstant: end,
      // Where the segment sits on a 24-hour clock face, for the grids. Clamped
      // because a DST day is 23 or 25 hours long and the grid has 24 rows.
      startMinutes: Math.min(1440, Math.max(0, Math.round((start - dayStart) / 60000))),
      endMinutes: Math.min(1440, Math.max(0, Math.round((end - dayStart) / 60000))),
      // Not clamped, because this is the number the year is counted in.
      realMinutes: Math.round((end - start) / 60000),
      enteredBy: piece.enteredBy,
      leftBy: piece.leftBy
    });
  }
  segments.sort((a, b) => a.startInstant - b.startInstant);
  if (zoneSegmentCache.size > 800) zoneSegmentCache.clear();
  zoneSegmentCache.set(key, segments);
  return segments;
}

// True once a date is worn by more than one zone -- the only case any of the
// segmented drawing below is needed for, and the cheap check to gate it on.
function isZoneTransitionDate(date) {
  return dateZoneSegments(date).length > 1;
}

// The zone you woke up in on that date, which is the one to label it with.
function zoneForDate(date) {
  const segments = dateZoneSegments(date);
  if (segments.length) return segments[0].zone;
  return zoneAtInstant(zoneWallClockToInstant(`${date}T12:00`, currentTimeZone()));
}

// The transitions that happened inside this date, in order.
function zoneTransitionsOnDate(date) {
  return dateZoneSegments(date)
    .map((segment) => segment.leftBy)
    .filter((row, index, rows) => row && rows.indexOf(row) === index);
}

/* How much real time this date actually held. 1440 on an ordinary day, 1380 or
   1500 across a DST change, 0 on a date the date line ate, and anything from a
   couple of hours to 35 on a travel day. Every average, total and streak that
   used to divide by 24 should be asking this instead. */
function dateRealMinutes(date) {
  const segments = dateZoneSegments(date);
  if (!segments.length) return isZoneKnownDate(date) ? 0 : 1440;
  return segments.reduce((total, segment) => total + segment.realMinutes, 0);
}

/* A date with no segments is only a date that never happened if the log is in a
   position to know. Before the first recorded transition, and whenever the
   server has not answered, the timeline is a single unbounded piece and every
   date is an ordinary one -- which is what the fallback above returns. */
function isZoneKnownDate(date) {
  return zoneTransitionsLoaded && zoneTransitions.length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(String(date || ""));
}

// A date short enough that judging a habit against it would be unfair, and the
// dateline case where it is not a date at all.
function isShortZoneDate(date) {
  return isZoneKnownDate(date) && dateRealMinutes(date) < ZONE_SHORT_DAY_MINUTES;
}

/* --- Keeping the log and the calendar agreeing -------------------------------

   A shift is captured on the block it happened during, so the block is the
   thing that owns it: move the flight an hour later and the transition moves
   with it, delete the flight and the transition goes too. The alternative --
   two records drifting apart, the calendar saying one thing and the year's
   totals another -- is precisely the failure this feature exists to prevent.

   Rows entered by hand in Settings carry no eventId and are never touched here. */

function zoneTransitionFromEvent(event) {
  if (!event?.zoneShift) return null;
  const at = calendarEventShiftWallClock(event);
  if (!at) return null;
  const existing = zoneTransitions.find((row) => row.eventId === event.id);
  return normalizeZoneTransition({
    id: existing?.id || zoneTransitionId(),
    from: event.zoneShift.from,
    to: event.zoneShift.to,
    at,
    eventId: event.id,
    source: "event",
    note: existing?.note || "",
    createdAt: existing?.createdAt || new Date().toISOString()
  });
}

function applyZoneTransitionRows(rows) {
  const next = normalizeZoneTransitions(rows);
  if (JSON.stringify(next) === JSON.stringify(zoneTransitions)) return false;
  setZoneTransitions(next);
  return true;
}

/* Whether this block is the one that gets to write its move into the log. A
   plan block does, until an actual block records the same move -- the flight as
   flown outranks the flight as scheduled, and keeping both would draw two
   dividers through one landing. */
function eventOwnsZoneTransition(event, events) {
  if (!event?.zoneShift) return false;
  if (event.kind !== "plan") return true;
  for (const other of events.values()) {
    if (other === event || other.kind !== "actual" || !other.zoneShift) continue;
    if (other.zoneShift.from !== event.zoneShift.from || other.zoneShift.to !== event.zoneShift.to) continue;
    if (Math.abs(calendarEventStartInstant(other) - calendarEventStartInstant(event)) < 48 * 3600000) return false;
  }
  return true;
}

async function syncZoneTransitionForEvent(event) {
  if (!event?.id) return false;
  const events = new Map((state.calendarEvents || []).map((item) => [item.id, item]));
  if (!events.has(event.id)) events.set(event.id, event);
  const next = eventOwnsZoneTransition(events.get(event.id), events) ? zoneTransitionFromEvent(event) : null;
  // Saving an actual flight also evicts the plan copy's row, not just this
  // event's own -- see eventOwnsZoneTransition.
  const rows = zoneTransitions.filter(
    (row) => row.eventId !== event.id && (!row.eventId || eventOwnsZoneTransition(events.get(row.eventId), events))
  );
  if (next) rows.push(next);
  if (!applyZoneTransitionRows(rows)) return false;
  await saveTimezoneHistory();
  return true;
}

async function removeZoneTransitionForEvent(eventId) {
  if (!eventId) return false;
  if (!applyZoneTransitionRows(zoneTransitions.filter((row) => row.eventId !== eventId))) return false;
  await saveTimezoneHistory();
  return true;
}

/* Run once both halves are on the table. An event-owned row whose block no
   longer exists is an orphan -- the flight was deleted from another device, or
   before this reconciliation existed -- and an orphan silently bends every
   total after it, so it goes. Nothing is written unless something actually
   changed, which keeps this off the critical path of an ordinary load. */
async function reconcileZoneTransitionsWithCalendar() {
  if (!zoneTransitionsLoaded || !calendarEventsLoaded) return false;
  const events = new Map((state.calendarEvents || []).map((event) => [event.id, event]));
  // An event-owned row survives only while its event exists, still carries a
  // shift, and outranks any duplicate -- see eventOwnsZoneTransition.
  const rows = zoneTransitions.filter((row) => !row.eventId || eventOwnsZoneTransition(events.get(row.eventId), events));
  for (const event of events.values()) {
    if (!eventOwnsZoneTransition(event, events)) continue;
    const next = zoneTransitionFromEvent(event);
    if (!next) continue;
    const index = rows.findIndex((row) => row.eventId === event.id);
    if (index === -1) rows.push(next);
    else if (rows[index].at !== next.at || rows[index].from !== next.from || rows[index].to !== next.to) rows[index] = next;
  }
  if (!applyZoneTransitionRows(rows)) return false;
  await saveTimezoneHistory();
  return true;
}

function formatDateLine(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function yyyymmdd(dateString) {
  return dateString.replaceAll("-", "");
}

function hourLabel(hour) {
  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour % 12 || 12;
  return `${displayHour} ${period}`;
}

function defaultSession() {
  return { text: "", checked: {}, survey: {}, customChoices: {}, processedAt: null };
}

function defaultEntry(dateString) {
  return {
    date: dateString,
    morning: defaultSession(),
    night: defaultSession(),
    hours: {
      plan: Array(24).fill(""),
      reality: Array(24).fill(""),
      categories: Array(24).fill("")
    },
    tasks: defaultTasks(),
    mistakes: [],
    journal: "",
    journalHtml: ""
  };
}

function defaultTasks() {
  return { rightNow: [], inbox: [], today: [], upcoming: [], completed: [], discarded: [] };
}

function ensureEntry(dateString) {
  ensureCustomChoiceState();
  if (!state.entries[dateString]) state.entries[dateString] = defaultEntry(dateString);
  if (typeof state.entries[dateString].journal !== "string") state.entries[dateString].journal = "";
  if (typeof state.entries[dateString].journalHtml !== "string") state.entries[dateString].journalHtml = "";
  ensureTaskState(state.entries[dateString]);
  for (const session of ["morning", "night"]) {
    if (!state.entries[dateString][session]) state.entries[dateString][session] = defaultSession();
    if (!state.entries[dateString][session].checked) state.entries[dateString][session].checked = {};
    if (!state.entries[dateString][session].survey) state.entries[dateString][session].survey = {};
    if (!state.entries[dateString][session].customChoices) state.entries[dateString][session].customChoices = {};
  }
  ensureMistakeState(state.entries[dateString]);
  if (!state.entries[dateString].journal && (state.entries[dateString].morning.text || state.entries[dateString].night.text)) {
    state.entries[dateString].journal = [state.entries[dateString].morning.text, state.entries[dateString].night.text].filter(Boolean).join("\n\n---\n\n");
  }
  // Days written before the Document view gained formatting only have the plain
  // string. Promote it once so the editor has markup to work with; the mirror
  // keeps the plain field authoritative for everything downstream.
  if (!state.entries[dateString].journalHtml.trim() && state.entries[dateString].journal.trim()) {
    state.entries[dateString].journalHtml = docHtmlFromPlainText(state.entries[dateString].journal);
  }
  if (!state.entries[dateString].hours) {
    state.entries[dateString].hours = {
      plan: Array(24).fill(""),
      reality: Array(24).fill(""),
      categories: Array(24).fill("")
    };
  }
}

function ensureTaskState(entry) {
  if (!entry.tasks) entry.tasks = defaultTasks();
  for (const key of [...TASK_SECTION_KEYS, "completed", "discarded"]) {
    if (!Array.isArray(entry.tasks[key])) entry.tasks[key] = [];
  }
  for (const key of TASK_SECTION_KEYS) {
    entry.tasks[key] = entry.tasks[key].map((task) => normalizeTask(task, key));
  }
  entry.tasks.completed = entry.tasks.completed.map((task) => normalizeTask(task, task.source || "today"));
  entry.tasks.discarded = entry.tasks.discarded.map((task) => normalizeTask(task, task.source || "today"));
}

// A lesson is captured in one line ("what") the moment it happens; the outcome
// and the reflective columns are usually filled in later, so a row with only
// "what" is valid and just counts as unfinished.
// Normalizes in place. ensureEntry() runs on every currentEntry() call, so
// replacing the row objects here would orphan the textareas already bound to
// them and the open editor would stop updating.
function ensureMistakeState(entry) {
  if (!Array.isArray(entry.mistakes)) entry.mistakes = [];
  for (let index = 0; index < entry.mistakes.length; index += 1) {
    const current = entry.mistakes[index];
    if (current && typeof current === "object") Object.assign(current, normalizeMistake(current));
    else entry.mistakes[index] = normalizeMistake(current);
  }
}

function normalizeMistake(mistake) {
  const source = mistake && typeof mistake === "object" ? mistake : {};
  return {
    // Unknown keys are carried through, not dropped. A window still running an
    // older app.js would otherwise strip any column added since it loaded and
    // silently destroy it on the next whole-entry save -- which is exactly what
    // happened to "alternative" when it was first added.
    ...source,
    id: source.id || mistakeId(),
    time: typeof source.time === "string" ? source.time : "",
    // When the mistake happened, ISO. Null when it was logged after the fact and
    // the real time is unknown -- see mistake-capture.ps1's "This happened today"
    // box. Never guess a value here: a wrong hour is worse than no hour.
    ts: typeof source.ts === "string" && source.ts ? source.ts : null,
    // When the row was typed. Always known, and the gap between it and `ts` is
    // how long a mistake sat before being written down.
    loggedAt: typeof source.loggedAt === "string" && source.loggedAt ? source.loggedAt : null,
    what: typeof source.what === "string" ? source.what : "",
    problem: typeof source.problem === "string" ? source.problem : "",
    why: typeof source.why === "string" ? source.why : "",
    alternative: typeof source.alternative === "string" ? source.alternative : "",
    nextTime: typeof source.nextTime === "string" ? source.nextTime : "",
    // "good" | "bad" | "" (captured, not yet judged). A row with no outcome key
    // at all predates the neutral log and was logged as a mistake, so it stays
    // one; the empty string is only ever written on purpose.
    outcome: source.outcome === "good" || source.outcome === "bad" ? source.outcome
      : source.outcome === "" ? ""
      : "bad",
    // The pattern this row is an instance of. Free-form and always optional;
    // see MISTAKE_TAGS. Deduplicated case-insensitively but stored as typed,
    // so "Slow start" and "slow start" stay one tag rather than two rows
    // in the frequency count.
    tags: Array.isArray(source.tags)
      ? [...new Map(source.tags
          .map((tag) => String(tag || "").trim())
          .filter(Boolean)
          .map((tag) => [normalize(tag), tag])).values()]
      : []
  };
}

// Defaults plus everything ever typed, so the picker learns. Sorted by how often
// a tag has actually been used: the patterns that keep recurring rise to the
// front of the list, which is the whole point of tagging them.
function mistakeTagVocabulary() {
  const counts = mistakeTagCounts();
  const seen = new Map();
  for (const tag of MISTAKE_TAGS) seen.set(normalize(tag), tag);
  for (const [tag] of counts) if (!seen.has(normalize(tag))) seen.set(normalize(tag), tag);
  return [...seen.values()].sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0) || a.localeCompare(b));
}

function mistakeTagCounts(days = allMistakeDays()) {
  const counts = new Map();
  const display = new Map();
  for (const day of days) {
    for (const mistake of day.mistakes) {
      for (const tag of mistake.tags || []) {
        const key = normalize(tag);
        if (!display.has(key)) display.set(key, tag);
        counts.set(display.get(key), (counts.get(display.get(key)) || 0) + 1);
      }
    }
  }
  return counts;
}

function toggleMistakeTag(id, tag) {
  const clean = String(tag || "").trim();
  if (!clean) return;
  const entry = currentEntry();
  ensureMistakeState(entry);
  const mistake = entry.mistakes.find((item) => item.id === id);
  if (!mistake) return;
  const key = normalize(clean);
  const existing = (mistake.tags || []).filter((item) => normalize(item) !== key);
  mistake.tags = existing.length === (mistake.tags || []).length ? [...existing, clean] : existing;
  recordAppHistory();
  saveLocal();
  debouncedSave();
  renderMistakesView();
  renderMistakesOutput();
}

// How often this row's pattern has come up before. Counted across every day on
// record, not just this one -- "the fourth time this month" is the sentence
// worth reading, and a per-day count could never say it.
function mistakeTagRecurrence(mistake) {
  if (!(mistake.tags || []).length) return "";
  const counts = mistakeTagCounts();
  const parts = mistake.tags
    .map((tag) => ({ tag, count: counts.get(tag) || 0 }))
    .filter((item) => item.count > 1)
    .sort((a, b) => b.count - a.count)
    .map((item) => `${item.tag} ×${item.count}`);
  return parts.length ? `Logged before: ${parts.join(" · ")}` : "";
}

function mistakeId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `mistake-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function mistakeIsComplete(mistake) {
  return Boolean(mistake.outcome) && MISTAKE_COLUMNS.every((column) => String(mistake[column.key] || "").trim());
}

function unfinishedMistakeCount(entry) {
  return (entry.mistakes || []).filter((mistake) => !mistakeIsComplete(mistake)).length;
}

function addMistake(what, outcome = "") {
  const text = String(what || "").trim();
  if (!text) return null;
  const entry = currentEntry();
  ensureMistakeState(entry);
  const now = new Date();
  // Adding a row while looking at an older day is the same case as unticking
  // "This happened today" in the capture window: the date is known, the time is
  // not, so ts stays null rather than inheriting this moment.
  const happenedToday = (state.currentDate || todayISO()) === todayISO();
  const mistake = normalizeMistake({
    what: text,
    outcome: outcome === "good" || outcome === "bad" ? outcome : "",
    time: happenedToday ? formatClockTime(now) : "",
    ts: happenedToday ? now.toISOString() : null,
    loggedAt: now.toISOString()
  });
  entry.mistakes.push(mistake);
  recordAppHistory();
  saveLocal();
  debouncedSave();
  if (activeView === "mistakes") renderMistakesView();
  renderMistakesOutput();
  return mistake;
}

function updateMistakeField(id, key, value) {
  const entry = currentEntry();
  ensureMistakeState(entry);
  const mistake = entry.mistakes.find((item) => item.id === id);
  if (!mistake || mistake[key] === value) return;
  mistake[key] = value;
  saveLocal();
  debouncedSave();
}

function removeMistake(id) {
  const entry = currentEntry();
  ensureMistakeState(entry);
  const index = entry.mistakes.findIndex((item) => item.id === id);
  if (index < 0) return;
  entry.mistakes.splice(index, 1);
  removedMistakeIds.add(id);
  recordAppHistory();
  saveLocal();
  debouncedSave();
  renderMistakesView();
  renderMistakesOutput();
}

// Every day that has at least one logged mistake, newest first. All entries are
// already in memory from /api/entries, so the review pass needs no server call.
function allMistakeDays() {
  return Object.entries(state.entries || {})
    .map(([date, entry]) => ({ date, mistakes: Array.isArray(entry?.mistakes) ? entry.mistakes.map(normalizeMistake) : [] }))
    .filter((day) => day.mistakes.length)
    .sort((a, b) => b.date.localeCompare(a.date));
}

function reconcileDatedTasks() {
  const moves = [];
  for (const [entryDate, entry] of Object.entries(state.entries || {})) {
    ensureTaskState(entry);
    for (const sectionKey of TASK_SECTION_KEYS) {
      const list = entry.tasks[sectionKey];
      for (let index = list.length - 1; index >= 0; index -= 1) {
        const task = list[index];
        if (!task.dueDate || task.dueDate === entryDate) continue;
        list.splice(index, 1);
        moves.push({ task, targetDate: task.dueDate });
      }
    }
  }
  for (const move of moves) {
    ensureEntry(move.targetDate);
    move.task.updatedAt = move.task.updatedAt || new Date().toISOString();
    pushUniqueTask(state.entries[move.targetDate].tasks.today, move.task);
  }
  return moves.length > 0;
}

function pushUniqueTask(list, task) {
  if (!list.some((item) => item.id === task.id)) list.push(task);
}

function ensureColorState() {
  if (!state.colors) state.colors = { morning: {}, night: {} };
  if (!state.colors.morning) state.colors.morning = {};
  if (!state.colors.night) state.colors.night = {};
}

function ensureCustomChoiceState() {
  if (!state.customChoices) state.customChoices = { morning: {}, night: {} };
  if (!state.customChoices.morning) state.customChoices.morning = {};
  if (!state.customChoices.night) state.customChoices.night = {};
  if (!state.customChoices.choiceHistory) state.customChoices.choiceHistory = { morning: {}, night: {} };
  if (!state.customChoices.choiceHistory.morning) state.customChoices.choiceHistory.morning = {};
  if (!state.customChoices.choiceHistory.night) state.customChoices.choiceHistory.night = {};
  if (!state.customChoices.questionHistory) state.customChoices.questionHistory = { morning: {}, night: {} };
  if (!state.customChoices.questionHistory.morning) state.customChoices.questionHistory.morning = {};
  if (!state.customChoices.questionHistory.night) state.customChoices.questionHistory.night = {};
  if (!state.customChoices.customQuestions) state.customChoices.customQuestions = { morning: [], night: [] };
  if (!Array.isArray(state.customChoices.customQuestions.morning)) state.customChoices.customQuestions.morning = [];
  if (!Array.isArray(state.customChoices.customQuestions.night)) state.customChoices.customQuestions.night = [];
  if (!state.customChoices.questionOrder) state.customChoices.questionOrder = { morning: [], night: [] };
  if (!Array.isArray(state.customChoices.questionOrder.morning)) state.customChoices.questionOrder.morning = [];
  if (!Array.isArray(state.customChoices.questionOrder.night)) state.customChoices.questionOrder.night = [];
}

/* --- Questions added by hand ------------------------------------------------

   SCHEMA holds the questions the app shipped with. Anything added from the
   form's edit mode lives in `custom-choices.json` alongside the custom choices,
   because the two are edited from the same screen and saved by the same call.

   A custom question is a SCHEMA question with three extra keys: `custom: true`,
   `createdOn` (the date it was added) and `config` (whatever its type needs --
   a scale, a column list, a picture). It is otherwise the same object, so every
   reader downstream -- `appendSurveyControl`, `surveyValue`, the exporter --
   treats it identically and needs no special case.

   Visibility is the existing effective-dated mechanism, with one difference: a
   schema question defaults to visible on days before its first event, and a
   custom one defaults to *hidden*. Otherwise a question written today would
   appear, unanswered, on every day already in the journal.
--------------------------------------------------------------------------- */

function customQuestionsFor(sessionName) {
  ensureCustomChoiceState();
  return state.customChoices.customQuestions[sessionName] || [];
}

function isCustomQuestionId(sessionName, questionId) {
  return customQuestionsFor(sessionName).some((question) => question.id === questionId);
}

function normalizeCustomQuestion(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = String(raw.id || "").trim();
  const type = String(raw.type || "").trim();
  if (!id || !questionType(type)) return null;
  const question = {
    id,
    custom: true,
    type,
    label: String(raw.label || id),
    prompt: String(raw.prompt || raw.label || id),
    createdOn: /^\d{4}-\d{2}-\d{2}$/.test(raw.createdOn || "") ? raw.createdOn : "",
    config: raw.config && typeof raw.config === "object" ? { ...raw.config } : {}
  };
  if (Array.isArray(raw.choices)) question.choices = raw.choices.map((choice) => String(choiceDisplay(choice) ?? "")).filter(Boolean);
  if (Array.isArray(raw.fields)) question.fields = raw.fields.map((field) => String(field)).filter(Boolean);
  if (raw.optional) question.optional = true;
  return question;
}

// Schema order first, then anything added by hand, then the saved order is
// applied over the top. An id the order list has never heard of keeps its
// natural position rather than being dropped.
function orderSurveyQuestions(sessionName, questions) {
  ensureCustomChoiceState();
  const order = state.customChoices.questionOrder[sessionName] || [];
  if (!order.length) return questions;
  const rank = new Map(order.map((id, index) => [id, index]));
  return questions
    .map((question, index) => ({ question, index }))
    .sort((a, b) => {
      const rankA = rank.has(a.question.id) ? rank.get(a.question.id) : Number.POSITIVE_INFINITY;
      const rankB = rank.has(b.question.id) ? rank.get(b.question.id) : Number.POSITIVE_INFINITY;
      if (rankA !== rankB) return rankA - rankB;
      return a.index - b.index;
    })
    .map((item) => item.question);
}

function allSurveyQuestions(sessionName) {
  const custom = customQuestionsFor(sessionName).map(normalizeCustomQuestion).filter(Boolean);
  return orderSurveyQuestions(sessionName, [...SCHEMA.surveys[sessionName], ...custom]);
}

function surveyQuestionById(sessionName, questionId) {
  return allSurveyQuestions(sessionName).find((question) => question.id === questionId) || null;
}

// Adds and removals are effective-dated: an event recorded on a date applies to
// that date and every later date, so earlier days keep the survey they had.
function recordSurveyEvent(events, dateString, action) {
  const list = Array.isArray(events) ? events.filter((event) => event.date !== dateString) : [];
  list.push({ date: dateString, action });
  list.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return list;
}

function resolveSurveyVisibility(events, dateString, defaultVisible) {
  let visible = defaultVisible;
  for (const event of events || []) {
    if (event.date > dateString) break;
    visible = event.action === "add";
  }
  return visible;
}

function choiceHistoryFor(sessionName, questionId, display) {
  ensureCustomChoiceState();
  return state.customChoices.choiceHistory[sessionName]?.[questionId]?.[normalize(String(display))] || [];
}

function recordChoiceEvent(sessionName, questionId, display, dateString, action) {
  ensureCustomChoiceState();
  const bySession = state.customChoices.choiceHistory[sessionName];
  if (!bySession[questionId]) bySession[questionId] = {};
  const key = normalize(String(display));
  bySession[questionId][key] = recordSurveyEvent(bySession[questionId][key], dateString, action);
}

// Untracked choices (schema defaults and pre-effective-dating custom choices)
// stay visible everywhere. Once a choice has history, dates before its first
// event fall back to whether the schema shipped it.
function isChoiceVisibleOn(sessionName, questionId, display, dateString, isBaseChoice = true) {
  const events = choiceHistoryFor(sessionName, questionId, display);
  if (!events.length) return true;
  return resolveSurveyVisibility(events, dateString, isBaseChoice);
}

function questionHistoryFor(sessionName, questionId) {
  ensureCustomChoiceState();
  return state.customChoices.questionHistory[sessionName]?.[questionId] || [];
}

function recordQuestionEvent(sessionName, questionId, dateString, action) {
  ensureCustomChoiceState();
  const bySession = state.customChoices.questionHistory[sessionName];
  bySession[questionId] = recordSurveyEvent(bySession[questionId], dateString, action);
}

// A schema question is visible on days before its first add/remove event; a
// question written by hand is not, or it would appear unanswered on every day
// already in the journal. `defaultVisible` carries that difference.
function isQuestionVisibleOn(sessionName, questionId, dateString, defaultVisible = true) {
  return resolveSurveyVisibility(questionHistoryFor(sessionName, questionId), dateString, defaultVisible);
}

function isSurveyQuestionVisibleOn(sessionName, question, dateString) {
  return isQuestionVisibleOn(sessionName, question.id, dateString, !question.custom);
}

function migrateEntryCustomChoices() {
  ensureCustomChoiceState();
  for (const entry of Object.values(state.entries || {})) {
    for (const sessionName of ["morning", "night"]) {
      const session = entry?.[sessionName];
      if (!session?.customChoices) continue;
      for (const [questionId, choices] of Object.entries(session.customChoices)) {
        for (const choice of choices || []) addPersistentChoice(sessionName, questionId, choice, { select: false });
      }
      session.customChoices = {};
    }
  }
}

function currentEntry() {
  ensureEntry(state.currentDate);
  return state.entries[state.currentDate];
}

function currentSession() {
  return currentEntry()[state.session];
}

// Every event this app has normalised, so a second pass over the same object
// can be skipped. Normalising is idempotent but not free -- a fresh object per
// event, a date stamp, several regexes -- and eventsForDay() runs this first,
// so a week digest was rebuilding the whole stored list a dozen times over.
// Held weakly: an event dropped from state.calendarEvents is collectable.
const normalizedCalendarEvents = new WeakSet();

function rememberNormalizedCalendarEvents(events) {
  for (const event of events) normalizedCalendarEvents.add(event);
  return events;
}

function ensureCalendarState() {
  if (!Array.isArray(state.calendarEvents)) state.calendarEvents = [];
  // A raw event pushed onto the list still gets normalised; the already-clean
  // ones cost a WeakSet probe each instead of a rebuild.
  if (state.calendarEvents.every((event) => normalizedCalendarEvents.has(event))) return;
  state.calendarEvents = rememberNormalizedCalendarEvents(
    state.calendarEvents
      .map((event) => (normalizedCalendarEvents.has(event) ? event : normalizeCalendarEvent(event)))
      .filter(Boolean)
  );
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (parsed && parsed.entries) {
      if (!Array.isArray(parsed.calendarEvents)) parsed.calendarEvents = [];
      return parsed;
    }
  } catch {
    // Ignore broken local state and start fresh.
  }
  return { currentDate: todayISO(), session: inferTheme(), theme: inferTheme(), paneSizes: defaultPaneSizes(), colors: { morning: {}, night: {} }, calendarEvents: [], entries: {} };
}

function setColorOverride(key, value) {
  ensureColorState();
  const theme = state.theme === "night" ? "night" : "morning";
  state.colors[theme][key] = value;
  applyColors();
  renderColorControls();
  saveLocal();
}

function resetColorOverrides() {
  ensureColorState();
  const theme = state.theme === "night" ? "night" : "morning";
  state.colors[theme] = {};
  applyColors();
  renderColorControls();
  saveLocal();
}

function currentThemeColors() {
  ensureColorState();
  const theme = state.theme === "night" ? "night" : "morning";
  return { ...THEME_COLORS[theme], ...state.colors[theme] };
}

function applyColors() {
  const theme = state.theme === "night" ? "night" : "morning";
  const defaults = THEME_COLORS[theme];
  const colors = currentThemeColors();
  setOptionalColorVar(document.body, "--bg", colors.bg, defaults.bg);
  setOptionalColorVar(document.body, "--panel", colors.panel, defaults.panel);
  setOptionalColorVar(document.body, "--accent", colors.accent, defaults.accent);
  document.body.style.setProperty("--panel-2", mixHex(colors.panel, colors.bg, 0.56));
  document.body.style.setProperty("--line", mixHex(colors.panel, colors.ink, theme === "night" ? 0.24 : 0.16));
  document.body.style.setProperty("--accent-3", mixHex(colors.accent, theme === "night" ? "#ffffff" : "#000000", 0.24));
  document.body.style.setProperty("--shadow", theme === "night" ? "0 12px 32px rgba(0, 0, 0, 0.28)" : `0 12px 32px ${hexToRgba(colors.ink, 0.08)}`);
  // In standalone mode iOS paints the status bar area with the theme-color
  // meta, and the phone layout runs the topbar's panel colour up under it, so
  // the two must track together or the status bar shows as a mismatched strip
  // (it used to be a hardcoded teal that matched nothing in night mode).
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) themeColorMeta.setAttribute("content", colors.panel);
}

function setOptionalColorVar(target, name, value, defaultValue) {
  if (normalizeHex(value) === normalizeHex(defaultValue)) target.style.removeProperty(name);
  else target.style.setProperty(name, value);
}

function renderColorControls() {
  if (!els.accentColorInput) return;
  const colors = currentThemeColors();
  els.accentColorInput.value = colors.accent;
  els.bgColorInput.value = colors.bg;
  els.panelColorInput.value = colors.panel;
}

function normalizeHex(value) {
  return String(value || "").trim().toLowerCase();
}

function mixHex(a, b, amount) {
  const first = hexToRgb(a);
  const second = hexToRgb(b);
  if (!first || !second) return a;
  const mix = (x, y) => Math.round(x * (1 - amount) + y * amount);
  return rgbToHex(mix(first.r, second.r), mix(first.g, second.g), mix(first.b, second.b));
}

function hexToRgb(value) {
  const match = /^#?([a-f0-9]{6})$/i.exec(String(value || "").trim());
  if (!match) return null;
  const hex = match[1];
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16)
  };
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function hexToRgba(hex, alpha) {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(29, 37, 40, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function relativeLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const channel = (value) => {
    const normalized = value / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

function contrastRatio(a, b) {
  const first = relativeLuminance(a);
  const second = relativeLuminance(b);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

function readableEventColors(eventColor) {
  const colors = currentThemeColors();
  // Must track the background mix in .calendar-event-chip: the contrast test
  // below is only meaningful if it is run against the colour actually painted.
  const background = mixHex(eventColor, colors.panel, 0.91);
  const darkText = mixHex("#000000", background, 0.1);
  const lightText = mixHex("#ffffff", background, 0.14);
  const text = contrastRatio(background, darkText) >= contrastRatio(background, lightText) ? darkText : lightText;
  return {
    text,
    muted: mixHex(text, background, 0.34)
  };
}

function blockZhongwenDictionary() {
  removeZhongwenNodes(document);
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) removeZhongwenNodes(node);
      }
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

function removeZhongwenNodes(root) {
  for (const selector of ZHONGWEN_SELECTORS) {
    try {
      if (root.matches?.(selector) && root !== document.body && root !== document.documentElement) {
        root.remove();
        return;
      }
      root.querySelectorAll?.(selector).forEach((node) => {
        if (node !== document.body && node !== document.documentElement) node.remove();
      });
    } catch {
      // Extension DOM can change while we scan it; the observer catches the next pass.
    }
  }
}

/* The left pane can be dragged down to a bare icon rail. LEFT_RAIL_MAX is the
   width below which "Morning Survey" stops fitting on one line, so below it the
   side nav swaps its labels for icons and the guide body is hidden. */
const LEFT_PANE_MIN = 64;
const LEFT_PANE_MAX = 620;
const LEFT_RAIL_MAX = 170;

function defaultPaneSizes() {
  return { left: 310, right: 520, outputCollapsed: false };
}

function ensurePaneSizes() {
  if (!state.paneSizes) state.paneSizes = defaultPaneSizes();
  state.paneSizes.left = clampPaneSize(Number(state.paneSizes.left) || 310, LEFT_PANE_MIN, LEFT_PANE_MAX);
  state.paneSizes.right = clampPaneSize(Number(state.paneSizes.right) || 520, 300, 760);
  state.paneSizes.outputCollapsed = Boolean(state.paneSizes.outputCollapsed);
}

function clampPaneSize(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function applyPaneSizes() {
  ensurePaneSizes();
  document.documentElement.style.setProperty("--left-pane", `${state.paneSizes.left}px`);
  document.documentElement.style.setProperty("--right-pane", `${state.paneSizes.right}px`);
  document.body.classList.toggle("output-collapsed", state.paneSizes.outputCollapsed);
  document.body.classList.toggle("left-rail", state.paneSizes.left < LEFT_RAIL_MAX);
}

function wireResizeHandles() {
  const startDrag = (side, event) => {
    event.preventDefault();
    ensurePaneSizes();
    const startX = event.clientX;
    const startLeft = state.paneSizes.left;
    const startRight = state.paneSizes.right;
    document.body.classList.add("resizing");
    const move = (moveEvent) => {
      const delta = moveEvent.clientX - startX;
      if (side === "left") state.paneSizes.left = clampPaneSize(startLeft + delta, LEFT_PANE_MIN, LEFT_PANE_MAX);
      if (side === "right" && !state.paneSizes.outputCollapsed) state.paneSizes.right = clampPaneSize(startRight - delta, 300, 760);
      applyPaneSizes();
    };
    const stop = () => {
      document.body.classList.remove("resizing");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      saveLocal();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  };
  els.leftResizeHandle.addEventListener("pointerdown", (event) => startDrag("left", event));
  els.rightResizeHandle.addEventListener("pointerdown", (event) => startDrag("right", event));
}

/* Narrow viewports hide the desktop-only chrome (colors, search, the guide
   checklist, the export row and the output panel) so the phone shows only the
   active view. This reveals them again; it is presentation only, so it is not
   persisted and never touches entry state. */
function toggleMobileMore() {
  const open = document.body.classList.toggle("mobile-more-open");
  els.mobileMoreButton.setAttribute("aria-expanded", String(open));
  const label = open ? "Hide more panels" : "Show more panels";
  els.mobileMoreButton.title = label;
  els.mobileMoreButton.setAttribute("aria-label", label);
}

function toggleOutputPanel() {
  ensurePaneSizes();
  state.paneSizes.outputCollapsed = !state.paneSizes.outputCollapsed;
  applyPaneSizes();
  renderOutputPanelState();
  saveLocal();
}

function saveLocal() {
  ensurePaneSizes();
  ensureColorState();
  writeLocalSnapshot();
  scheduleSettingsSave();
  if (els.saveStatus) {
    els.saveStatus.textContent = localSnapshotFailed
      ? `Saved to disk only ${formatClockTime(new Date())} — browser cache full`
      : `Saved locally ${formatClockTime(new Date())}`;
  }
  recordAppHistory();
}

/* --- Local snapshot ---------------------------------------------------------

   localStorage is only the crash and offline fallback. The app itself is served
   by server.cjs, so a session that gets this far with the server unreachable is
   already running out of the service-worker shell -- a narrow case, and one the
   most recent days cover.

   Writing the whole state here cost two things. Every 350 ms debounce tick paid
   a synchronous ~1 MB stringify on the main thread, half of it calendar events
   that calendar-events.json already holds and loadCalendarEvents() replaces
   wholesale at boot. And it was heading straight for the ~5 MB quota: 90 days of
   entries were already 468 KB after four months, and setItem throwing is not a
   soft failure -- see writeLocalSnapshot().
--------------------------------------------------------------------------- */

const LOCAL_SNAPSHOT_DAYS = 45;
let localSnapshotFailed = false;

function localSnapshot(days) {
  const keep = { ...state };
  delete keep.calendarEvents;
  const dates = Object.keys(state.entries || {}).sort();
  const recent = new Set(days > 0 ? dates.slice(-days) : []);
  // The day on screen is the one an offline reload has to come back to, whether
  // or not it falls inside the window.
  if (state.currentDate) recent.add(state.currentDate);
  keep.entries = {};
  for (const date of recent) {
    if (state.entries?.[date]) keep.entries[date] = state.entries[date];
  }
  return keep;
}

// Never throws. A QuotaExceededError used to escape saveLocal(), and because
// saveEverywhere() calls saveLocal() before entering its own try block, that
// took the disk save down with it -- the durable one -- silently, inside a
// setTimeout. Disk is the source of truth, so a full cache costs a narrower
// cache and nothing else.
function writeLocalSnapshot() {
  for (const days of [LOCAL_SNAPSHOT_DAYS, 7, 0]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localSnapshot(days)));
      localSnapshotFailed = false;
      return;
    } catch {
      // Quota, or storage disabled entirely. Retry with less before giving up.
    }
  }
  localSnapshotFailed = true;
}

function appHistorySnapshot() {
  return JSON.stringify({
    state,
    /* The Rolodex lives in its own file, outside state, so archiving someone
       used to land half in the undo stack: Ctrl+Z rewound the choice-history
       event the archive wrote and left the person archived anyway. Null while
       the registry has not loaded, so a snapshot from before the fetch cannot
       restore an empty list over a real one. */
    people: peopleLoaded ? peopleList : null,
    peopleSelectedId,
    activeTab,
    activeView,
    taskFilter,
    calendarMode,
    calendarCursorDate,
    calendarKindFilter
  });
}

function resetAppHistory() {
  appUndoStack = [appHistorySnapshot()];
  appRedoStack = [];
}

function recordAppHistory() {
  if (applyingAppHistory || !appUndoStack.length) return;
  const snapshot = appHistorySnapshot();
  if (snapshot === appUndoStack[appUndoStack.length - 1]) return;
  appUndoStack.push(snapshot);
  if (appUndoStack.length > APP_HISTORY_LIMIT) appUndoStack.shift();
  appRedoStack = [];
}

function restoreAppHistorySnapshot(snapshot) {
  const parsed = JSON.parse(snapshot);
  state = parsed.state;
  activeTab = parsed.activeTab || "survey";
  activeView = parsed.activeView === "planning" ? "calendar" : parsed.activeView || "document";
  taskFilter = parsed.taskFilter || "all";
  calendarMode = CALENDAR_VIEW_MODES.includes(parsed.calendarMode) ? parsed.calendarMode : "week";
  calendarCursorDate = /^\d{4}-\d{2}-\d{2}$/.test(parsed.calendarCursorDate || "") ? parsed.calendarCursorDate : state.currentDate || todayISO();
  calendarKindFilter = CALENDAR_KIND_FILTERS.includes(parsed.calendarKindFilter) ? parsed.calendarKindFilter : "both";
  calendarViewZoneMode = isCalendarViewZoneMode(parsed.calendarViewZoneMode) ? parsed.calendarViewZoneMode : "lived";
  favoriteTimeZones = normalizeFavoriteTimeZones(parsed.favoriteTimeZones);
  if (Array.isArray(parsed.people)) {
    peopleList = parsed.people;
    peopleSelectedId = peopleList.some((person) => person.id === parsed.peopleSelectedId) ? parsed.peopleSelectedId : null;
    // A rename in progress is keyed to the name its profile opened with, and
    // that origin no longer describes the record we just put back.
    renameSession = null;
  }
  editingCalendarEventId = null;
  editingCalendarOccurrenceDate = null;
  calendarDraftEvent = null;
  calendarPersistentDraftPreview = null;
  ensureEntry(state.currentDate || todayISO());
  ensureCalendarState();
  applyPaneSizes();
}

function persistRestoredAppHistory(label) {
  saveLocal();
  saveSettingsToDisk();
  saveEntryToDisk(currentEntry(), { includeCustomChoices: true }).catch(() => {});
  postCalendarEvents(state.calendarEvents || []);
  if (peopleLoaded) savePeopleToDisk();
  if (els.saveStatus) els.saveStatus.textContent = label;
}

function undoAppHistory() {
  if (appUndoStack.length <= 1) return false;
  appRedoStack.push(appUndoStack.pop());
  applyingAppHistory = true;
  try {
    restoreAppHistorySnapshot(appUndoStack[appUndoStack.length - 1]);
    render();
    persistRestoredAppHistory("Undone");
  } finally {
    applyingAppHistory = false;
  }
  return true;
}

function redoAppHistory() {
  if (!appRedoStack.length) return false;
  const snapshot = appRedoStack.pop();
  appUndoStack.push(snapshot);
  applyingAppHistory = true;
  try {
    restoreAppHistorySnapshot(snapshot);
    render();
    persistRestoredAppHistory("Redone");
  } finally {
    applyingAppHistory = false;
  }
  return true;
}

let saveTimer = null;
let settingsSaveTimer = null;
let pendingSaveExtraDates = new Set();
const entrySaveChains = new Map();
const entryBaseSnapshots = new Map();
// Fields where a 409 merge had to pick the disk value over this window's, kept so
// the save status can name them instead of resolving silently.
let conflictedEntryPaths = [];
function debouncedSave(options = {}) {
  for (const date of options.extraDates || []) {
    if (date) pendingSaveExtraDates.add(date);
  }
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const extraDates = [...pendingSaveExtraDates];
    pendingSaveExtraDates = new Set();
    saveEverywhere({ extraDates });
  }, 350);
}

async function saveEverywhere(options = {}) {
  syncDocumentText();
  saveLocal();
  const entry = currentEntry();
  const extraDates = [...new Set(options.extraDates || [])].filter((date) => date && date !== entry.date);
  conflictedEntryPaths = [];
  try {
    const [result] = await Promise.all([
      saveEntryToDisk(entry, { includeCustomChoices: true }),
      saveSettingsToDisk(),
      ...extraDates.map((date) => saveEntryToDisk(state.entries[date]))
    ]);
    if (conflictedEntryPaths.length) {
      const fields = [...new Set(conflictedEntryPaths)].join(", ");
      els.saveStatus.textContent = `Saved ${formatClockTime(new Date())} — ${fields} kept the other window's newer text; yours is in entries/.conflicts`;
      conflictedEntryPaths = [];
      return;
    }
    // options.status rides along on the save line rather than being written
    // just before it: a message set before the save resolves is gone in the
    // milliseconds after, which is no way to report a change to another view.
    els.saveStatus.textContent = `Saved ${formatClockTime(new Date())}${options.status ? ` — ${options.status}` : ""}`;
  } catch (error) {
    if (error?.name === "EntrySaveConflictError") {
      els.saveStatus.textContent = "Save conflict — newer disk copy kept; your version was backed up";
      return;
    }
    // The disk save failed (server down, network gone). The entry is still in
    // memory and localStorage, so keep retrying until it lands — before this,
    // "Saved locally" was the end of the story and a tab closed later lost the
    // edit to the startup rule that disk beats localStorage.
    offlinePendingSaveDates.add(entry.date);
    for (const date of extraDates) offlinePendingSaveDates.add(date);
    scheduleOfflineSaveRetry();
    els.saveStatus.textContent = `Saved locally ${formatClockTime(new Date())} — retrying when the server is back`;
  }
}

const offlinePendingSaveDates = new Set();
let offlineSaveRetryTimer = null;

function scheduleOfflineSaveRetry() {
  clearTimeout(offlineSaveRetryTimer);
  offlineSaveRetryTimer = setTimeout(retryOfflineEntrySaves, 15_000);
}

function retryOfflineEntrySaves() {
  if (!offlinePendingSaveDates.size) return;
  const dates = [...offlinePendingSaveDates];
  offlinePendingSaveDates.clear();
  // debouncedSave saves the current entry and every extra date; a failure puts
  // the dates back in the set via the catch above, so the retry loop lives
  // until the server answers.
  debouncedSave({ extraDates: dates });
}

function saveEntryToDisk(entry, options = {}) {
  const date = entry.date;
  const previous = entrySaveChains.get(date) || Promise.resolve();
  const next = previous.catch(() => {}).then(() => performEntrySave(entry, options));
  entrySaveChains.set(date, next);
  next.finally(() => {
    if (entrySaveChains.get(date) === next) entrySaveChains.delete(date);
  }).catch(() => {});
  return next;
}

async function performEntrySave(entry, options = {}, isRetry = false) {
  const expectedRevision = entryRevision(entry);
  const snapshot = cloneValue(entry);
  const response = await fetch("/api/entry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      entry: snapshot,
      expectedRevision,
      customChoices: options.includeCustomChoices ? state.customChoices : undefined,
      exports: { markdown: buildMarkdownExport(snapshot) }
    })
  });
  const result = await response.json().catch(() => ({}));
  if (response.status === 409 && result.entry && !isRetry) {
    const base = entryBaseSnapshots.get(entry.date);
    let merged = base ? mergeEntryVersions(base, snapshot, result.entry) : null;
    if (merged?.conflicts.length) {
      // A leaf both sides edited differently cannot be merged, but giving up here
      // is what wedged this window permanently: the revision and the base never
      // advanced, so every later save 409'd on the same leaf forever and no task
      // ever reached disk again. Swapping local and remote runs the same merge
      // with the disk value winning those leaves -- the one choice that
      // converges, since two windows that each kept their own would overwrite
      // each other indefinitely. Nothing is lost silently: the disk copy is on
      // disk, this attempt is archived in entries/.conflicts, and the status line
      // names the field.
      conflictedEntryPaths = merged.conflicts;
      merged = mergeEntryVersions(base, result.entry, snapshot);
    }
    if (merged) {
      applyMergedValue(entry, merged.value);
      entry._revision = entryRevision(result.entry);
      entry._savedAt = result.entry._savedAt || null;
      entryBaseSnapshots.set(entry.date, cloneValue(result.entry));
      return performEntrySave(entry, options, true);
    }
  }
  if (!response.ok) {
    const error = new Error(result.error || "Save failed");
    if (response.status === 409) error.name = "EntrySaveConflictError";
    throw error;
  }
  entry._revision = Number(result.revision) || entryRevision(result.entry);
  entry._savedAt = result.savedAt || result.entry?._savedAt || null;
  entryBaseSnapshots.set(entry.date, cloneValue(result.entry || snapshot));
  return result;
}

function entryRevision(entry) {
  const revision = Number(entry?._revision);
  return Number.isInteger(revision) && revision >= 0 ? revision : 0;
}

function cloneValue(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function sameValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

/* Mirror of the same pair in server.cjs -- see the block comment there. These
   two must hash identically or syncTasksFromDisk() would see a phantom change
   on every poll and never adopt a revision again. */

const ENTRY_SYNC_IGNORED_KEYS = new Set(["tasks", "mistakes", "_revision", "_savedAt"]);

function stableStringify(value) {
  if (value === null || typeof value !== "object") {
    const encoded = JSON.stringify(value);
    return encoded === undefined ? "null" : encoded;
  }
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(",")}}`;
}

function entrySyncFingerprint(entry) {
  if (!entry || typeof entry !== "object") return "";
  const rest = {};
  for (const key of Object.keys(entry)) {
    if (ENTRY_SYNC_IGNORED_KEYS.has(key)) continue;
    rest[key] = entry[key];
  }
  const text = stableStringify(rest);
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `${hash.toString(16)}-${text.length}`;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeEntryVersions(base, local, remote, path = "") {
  if (sameValue(local, base)) return { value: cloneValue(remote), conflicts: [] };
  if (sameValue(remote, base) || sameValue(local, remote)) return { value: cloneValue(local), conflicts: [] };
  if (isPlainObject(base) && isPlainObject(local) && isPlainObject(remote)) {
    const value = {};
    const conflicts = [];
    const keys = new Set([...Object.keys(base), ...Object.keys(local), ...Object.keys(remote)]);
    for (const key of keys) {
      if (key === "_revision" || key === "_savedAt") {
        value[key] = cloneValue(remote[key]);
        continue;
      }
      const childPath = path ? `${path}.${key}` : key;
      const merged = mergeEntryVersions(base[key], local[key], remote[key], childPath);
      value[key] = merged.value;
      conflicts.push(...merged.conflicts);
    }
    return { value, conflicts };
  }
  // A two-sided edit of the same text field is usually one sentence caught at two
  // keystrokes: the phone saved "Song: X -- " while this window had already typed
  // "Song: X -- Make Sure You're Loved". When one string extends the other,
  // neither side holds anything the longer one lacks, so take the later state
  // instead of declaring a conflict nothing can resolve.
  const continuation = laterKeystroke(base, local, remote);
  if (continuation !== undefined) return { value: continuation, conflicts: [] };
  // The document is the one leaf with a server-side *appender*: /api/quick-journal
  // (and the CBT thought record riding it) writes blocks onto the end of
  // journalHtml/journal. When one side is exactly base-plus-appended-suffix and
  // the other is a real edit, both survive by carrying the suffix onto the
  // edited copy — before this, the divergent-leaf rule resolved disk-side on
  // retry and whatever was being typed at that moment was overwritten by the
  // captured block (the "known race" in the quick-journal notes). Journal-only:
  // for any other field, gluing one side's tail onto the other would fabricate
  // an answer nobody wrote.
  if (path === "journalHtml" || path === "journal") {
    const appended = journalAppendMerge(base, local, remote);
    if (appended !== undefined) return { value: appended, conflicts: [] };
  }
  return { value: cloneValue(local), conflicts: [path || "entry"] };
}

// Runs only after laterKeystroke() declined, so neither side extends the other.
function journalAppendMerge(base, local, remote) {
  if (typeof base !== "string" || typeof local !== "string" || typeof remote !== "string") return undefined;
  if (!base) return undefined;
  if (remote.startsWith(base) && remote !== base) return local + remote.slice(base.length);
  if (local.startsWith(base) && local !== base) return remote + local.slice(base.length);
  return undefined;
}

function laterKeystroke(base, local, remote) {
  if (typeof local !== "string" || typeof remote !== "string") return undefined;
  if (base !== undefined && typeof base !== "string") return undefined;
  const prefix = typeof base === "string" ? base : "";
  // Both sides must have grown from the same text, or these are rival edits.
  if (!local.startsWith(prefix) || !remote.startsWith(prefix)) return undefined;
  if (local.startsWith(remote)) return local;
  if (remote.startsWith(local)) return remote;
  return undefined;
}

function applyMergedValue(target, source) {
  for (const key of Object.keys(target)) {
    if (!(key in source)) delete target[key];
  }
  for (const [key, value] of Object.entries(source)) {
    if (isPlainObject(target[key]) && isPlainObject(value)) applyMergedValue(target[key], value);
    else target[key] = cloneValue(value);
  }
}

function appSettings() {
  ensurePaneSizes();
  ensureColorState();
  return {
    currentDate: state.currentDate,
    session: state.session,
    theme: state.theme,
    paneSizes: state.paneSizes,
    colors: state.colors,
    calendarMode,
    calendarCursorDate,
    calendarKindFilter,
    calendarShowTentative,
    calendarViewZoneMode,
    favoriteTimeZones,
    calendarZoom,
    surveyCalendarOpen,
    desktopCalendarNotifications,
    celebrations,
    enabledQuestionTypes,
    activeTab,
    activeView,
    taskFilter,
    savedAt: new Date().toISOString()
  };
}

function mergeSettings(settings) {
  if (!settings || typeof settings !== "object") return;
  if (/^\d{4}-\d{2}-\d{2}$/.test(settings.currentDate || "")) state.currentDate = settings.currentDate;
  if (settings.session === "morning" || settings.session === "night") state.session = settings.session;
  if (settings.theme === "morning" || settings.theme === "night") state.theme = settings.theme;
  if (settings.paneSizes) state.paneSizes = settings.paneSizes;
  if (settings.colors) state.colors = settings.colors;
  if (CALENDAR_VIEW_MODES.includes(settings.calendarMode)) calendarMode = settings.calendarMode;
  if (/^\d{4}-\d{2}-\d{2}$/.test(settings.calendarCursorDate || "")) calendarCursorDate = settings.calendarCursorDate;
  if (CALENDAR_KIND_FILTERS.includes(settings.calendarKindFilter)) calendarKindFilter = settings.calendarKindFilter;
  if (typeof settings.calendarShowTentative === "boolean") calendarShowTentative = settings.calendarShowTentative;
  if (isCalendarViewZoneMode(settings.calendarViewZoneMode)) calendarViewZoneMode = settings.calendarViewZoneMode;
  if (Array.isArray(settings.favoriteTimeZones)) favoriteTimeZones = normalizeFavoriteTimeZones(settings.favoriteTimeZones);
  if (settings.calendarZoom != null) calendarZoom = normalizeCalendarZoom(settings.calendarZoom);
  if (typeof settings.surveyCalendarOpen === "boolean") surveyCalendarOpen = settings.surveyCalendarOpen;
  desktopCalendarNotifications = Boolean(settings.desktopCalendarNotifications);
  if (isPlainObject(settings.celebrations)) {
    for (const kind of CELEBRATION_KINDS) {
      if (kind.key in settings.celebrations) celebrations[kind.key] = Boolean(settings.celebrations[kind.key]);
    }
  }
  if (isPlainObject(settings.enabledQuestionTypes)) {
    for (const type of QUESTION_TYPES) {
      if (type.tier !== "optional") continue;
      if (type.key in settings.enabledQuestionTypes) {
        enabledQuestionTypes[type.key] = Boolean(settings.enabledQuestionTypes[type.key]);
      }
    }
  }
  if (["survey", "hours", "journal", "completed", "missing"].includes(settings.activeTab)) activeTab = settings.activeTab;
  if (settings.activeView === "planning") activeView = "calendar";
  else if (["document", "tasks", "calendar", "mistakes", "learn", "shopping", "people", "survey", "settings", "trends", "review"].includes(settings.activeView)) activeView = settings.activeView;
  if (TASK_FILTERS.some((filter) => filter.key === settings.taskFilter)) taskFilter = settings.taskFilter;
  ensureColorState();
  ensurePaneSizes();
  ensureEntry(state.currentDate);
}

function scheduleSettingsSave() {
  clearTimeout(settingsSaveTimer);
  settingsSaveTimer = setTimeout(saveSettingsToDisk, 500);
}

async function saveSettingsToDisk() {
  // See settingsLoaded: a tab that never got the disk copy is holding the
  // compiled-in defaults, not a version of the user's settings, and must not
  // write them. The load retry will bring the real ones in; until then the
  // in-memory values only reach localStorage.
  if (!settingsLoaded) return;
  // The settings file is written whole, so a tab that loaded an hour ago
  // would otherwise overwrite an alerts toggle made since on another device
  // (or in a fresh reload) with the stale value it loaded. The alerts flag is
  // re-read from disk first unless this tab is the one changing it.
  await adoptDesktopAlertsSettingFromDisk();
  try {
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appSettings())
    });
    desktopCalendarNotificationsOwned = false;
  } catch {
    // Local storage remains the immediate fallback.
  }
}

async function adoptDesktopAlertsSettingFromDisk() {
  if (desktopCalendarNotificationsOwned) return;
  try {
    const response = await fetch("/api/settings");
    if (!response.ok) return;
    const settings = await response.json();
    if (typeof settings?.desktopCalendarNotifications !== "boolean") return;
    if (settings.desktopCalendarNotifications === desktopCalendarNotifications) return;
    desktopCalendarNotifications = settings.desktopCalendarNotifications;
    if (activeView === "calendar") renderCalendarView();
  } catch {
    // Offline: keep what we have.
  }
}

function syncDocumentText() {
  if (activeView !== "document" || !els.journalDoc) return;
  const entry = currentEntry();
  // The editor is only trustworthy for the day it was last loaded with. Callers
  // run this right before a date switch, so a mismatch means the DOM still holds
  // some other day and must not be written into this entry.
  if (docLoadedDate !== entry.date) return;
  entry.journalHtml = els.journalDoc.innerHTML;
  entry.journal = docPlainText(els.journalDoc);
}

function flushSave() {
  syncDocumentText();
  clearTimeout(saveTimer);
  clearTimeout(settingsSaveTimer);
  writeLocalSnapshot();
  const entry = currentEntry();
  const entryPayload = JSON.stringify({ entry, expectedRevision: entryRevision(entry), customChoices: state.customChoices, exports: { markdown: buildMarkdownExport(entry) } });
  const settingsPayload = JSON.stringify(appSettings());
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/entry", new Blob([entryPayload], { type: "application/json" }));
    navigator.sendBeacon("/api/settings", new Blob([settingsPayload], { type: "application/json" }));
    return;
  }
  fetch("/api/entry", { method: "POST", headers: { "Content-Type": "application/json" }, body: entryPayload, keepalive: true }).catch(() => {});
  fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: settingsPayload, keepalive: true }).catch(() => {});
}

function formatClockTime(date) {
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

async function loadCustomChoicesFromDisk() {
  try {
    const response = await fetch("/api/custom-choices");
    if (!response.ok) return;
    const diskChoices = await response.json();
    mergeCustomChoiceState(diskChoices);
    migrateEntryCustomChoices();
    saveLocal();
    render();
    resetAppHistory();
  } catch {
    // Browser-only mode still works with localStorage.
  }
}

/* False until app-settings.json has actually come back from the server. The
   file is written whole on every saveLocal(), so a client that booted while the
   server was down -- the PWA restored by Windows after a reboot, seconds before
   launch-journal.ps1 had the server listening -- would otherwise hold nothing
   but the compiled-in defaults, and push them over the file the moment the
   server answered. That is how a settings list lost two entries on 2026-09-10
   and how hourly alerts switched themselves off before that. Same rule as calendarEventsLoaded: nothing may write the
   settings to disk while this is false, and the load keeps retrying until it
   lands. */
let settingsLoaded = false;
const SETTINGS_LOAD_RETRY_MIN_MS = 3000;
const SETTINGS_LOAD_RETRY_MAX_MS = 30000;
let settingsLoadRetryDelay = SETTINGS_LOAD_RETRY_MIN_MS;
let settingsLoadRetryTimer = null;

async function loadSettingsFromDisk(options = {}) {
  try {
    const response = await fetch("/api/settings");
    if (response.ok) {
      const settings = await response.json();
      mergeSettings(settings);
      settingsLoaded = true;
      applyPaneSizes();
      saveLocal();
      if (options.renderAfter !== false) render();
      resetAppHistory();
    }
  } catch (error) {
    // LocalStorage settings remain available if the server is offline; the
    // retry below picks the disk copy up once it answers.
    console.warn("Settings load failed; retrying", error);
  }
  if (settingsLoaded) {
    if (settingsLoadRetryTimer) {
      clearTimeout(settingsLoadRetryTimer);
      settingsLoadRetryTimer = null;
    }
    settingsLoadRetryDelay = SETTINGS_LOAD_RETRY_MIN_MS;
    return;
  }
  scheduleSettingsLoadRetry();
}

function scheduleSettingsLoadRetry() {
  if (settingsLoadRetryTimer) return;
  settingsLoadRetryTimer = setTimeout(() => {
    settingsLoadRetryTimer = null;
    settingsLoadRetryDelay = Math.min(settingsLoadRetryDelay * 2, SETTINGS_LOAD_RETRY_MAX_MS);
    loadSettingsFromDisk();
  }, settingsLoadRetryDelay);
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible" || settingsLoaded) return;
  if (settingsLoadRetryTimer) {
    clearTimeout(settingsLoadRetryTimer);
    settingsLoadRetryTimer = null;
  }
  settingsLoadRetryDelay = SETTINGS_LOAD_RETRY_MIN_MS;
  loadSettingsFromDisk();
});

async function loadEntriesFromDisk() {
  try {
    const response = await fetch("/api/entries");
    if (!response.ok) return;
    const data = await response.json();
    for (const [date, entry] of Object.entries(data.entries || {})) {
      ensureTaskState(entry);
      state.entries[date] = entry;
      entryBaseSnapshots.set(date, cloneValue(entry));
    }
    // The loaders run in parallel and another one's render() can land before
    // this fetch returns, so the editor may already hold the placeholder entry
    // for a day that disk has a real copy of. That placeholder must never be
    // synced back into the disk copy (a browser with no localStorage copy of
    // the journal lost the day's document this way): forget the load date so
    // syncDocumentText() refuses the stale DOM, and reload the editor from what
    // disk actually holds.
    if (docLoadedDate && data.entries && data.entries[docLoadedDate]) {
      docLoadedDate = null;
      if (activeView === "document") renderDocumentEditor(currentEntry());
    }
    ensureEntry(state.currentDate);
    const migrated = reconcileDatedTasks();
    saveLocal();
    if (migrated) {
      await Promise.all(Object.values(state.entries).map((entry) => saveEntryToDisk(entry)));
    }
    if (activeView === "tasks") renderTasksView();
    renderSidePanel();
    renderSearchResults();
    resetAppHistory();
  } catch {
    // LocalStorage entries are still searchable.
  }
}

/* False until the calendar has actually come back from the server. An empty
   state.calendarEvents means two completely different things -- "you have no
   events" and "nobody has told me your events yet" -- and every destructive path
   in this file used to read it as the first.

   That is the whole of the 2026-08-17 near-miss: server down, app served from
   the cached shell, empty week on screen, and one drag away from POSTing [] over
   856 events. Nothing may write the calendar to disk while this is false. */
let calendarEventsLoaded = false;

async function loadCalendarEventsFromDisk() {
  try {
    const response = await fetch("/api/calendar-events");
    if (!response.ok) return;
    const data = await response.json();
    state.calendarEvents = normalizeCalendarEvents(data.events || []);
    calendarEventsLoaded = true;
    await reconcileZoneTransitionsWithCalendar();
    saveLocal();
    if (activeView === "calendar") {
      renderSidePanel();
      renderCalendarView();
    }
    resetAppHistory();
  } catch (error) {
    console.warn("Calendar load failed; retrying", error);
    // calendar-events.json is the only store for these -- localSnapshot() leaves
    // them out deliberately -- so an unreachable server means an empty calendar
    // until it answers. Not acceptable is letting that empty view be saved back
    // (see the flag above), or leaving it on screen once the server returns.
  }
  if (calendarEventsLoaded) {
    if (calendarLoadRetryTimer) {
      clearTimeout(calendarLoadRetryTimer);
      calendarLoadRetryTimer = null;
    }
    calendarLoadRetryDelay = CALENDAR_LOAD_RETRY_MIN_MS;
    return;
  }
  scheduleCalendarLoadRetry();
}

/* The load used to happen once, at startup, and never again. So a server that
   was down for the twenty seconds the app happened to boot in left an empty week
   on screen for the rest of the session -- indistinguishable from a real empty
   week, and only fixed by the user thinking to reload.

   That is not a hypothetical: it happened twice on the night of 2026-08-17, the
   second time while another window was restarting the server. The calendar is
   the one view with nothing behind it in localStorage, so it is the one view
   that has to come back on its own. */
const CALENDAR_LOAD_RETRY_MIN_MS = 3000;
const CALENDAR_LOAD_RETRY_MAX_MS = 30000;
let calendarLoadRetryDelay = CALENDAR_LOAD_RETRY_MIN_MS;
let calendarLoadRetryTimer = null;

function scheduleCalendarLoadRetry() {
  if (els.saveStatus) {
    const seconds = Math.round(calendarLoadRetryDelay / 1000);
    els.saveStatus.textContent =
      `Calendar unavailable — server not reachable. Your events are safe on disk; retrying in ${seconds}s.`;
  }
  if (calendarLoadRetryTimer) return;
  calendarLoadRetryTimer = setTimeout(() => {
    calendarLoadRetryTimer = null;
    // Backs off to 30 s rather than hammering a server that is down for a while,
    // but stays fast enough that a restart is picked up before the user has
    // finished wondering where their day went.
    calendarLoadRetryDelay = Math.min(calendarLoadRetryDelay * 2, CALENDAR_LOAD_RETRY_MAX_MS);
    loadCalendarEventsFromDisk();
  }, calendarLoadRetryDelay);
}

/* Coming back to the window is the strongest hint that time has passed and the
   server may be up again, and it costs one request. Waiting out the backoff when
   the user is right there looking at an empty calendar is the wrong trade. */
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible" || calendarEventsLoaded) return;
  if (calendarLoadRetryTimer) {
    clearTimeout(calendarLoadRetryTimer);
    calendarLoadRetryTimer = null;
  }
  calendarLoadRetryDelay = CALENDAR_LOAD_RETRY_MIN_MS;
  loadCalendarEventsFromDisk();
});

async function loadGoogleCalendarStatus(options = {}) {
  try {
    const response = await fetch("/api/google-calendar/status");
    if (!response.ok) return;
    googleCalendarStatus = await response.json();
    if (options.render) renderCalendarConnectionsSurface();
  } catch {
    googleCalendarStatus = null;
  }
}

async function saveGoogleCalendarConfig(form) {
  const data = new FormData(form);
  const response = await fetch("/api/google-calendar/config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: data.get("clientId"),
      clientSecret: data.get("clientSecret"),
      calendarId: data.get("calendarId") || "primary",
      lookbackDays: data.get("lookbackDays") || 30,
      lookaheadDays: data.get("lookaheadDays") || 180
    })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Could not save Google Calendar settings.");
  googleCalendarStatus = result.status;
  if (els.saveStatus) els.saveStatus.textContent = "Google Calendar settings saved";
  return result;
}

async function connectGoogleCalendar(form = null) {
  try {
    if (form) await saveGoogleCalendarConfig(form);
    const response = await fetch("/api/google-calendar/connect", { method: "POST" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not start Google Calendar connection.");
    window.open(result.authUrl, "google-calendar-oauth", "width=720,height=760");
    if (els.saveStatus) els.saveStatus.textContent = "Finish Google sign-in in the new window";
    startGoogleCalendarStatusPolling();
  } catch (error) {
    if (els.saveStatus) els.saveStatus.textContent = error.message || "Google Calendar connection failed";
  }
}

function startGoogleCalendarStatusPolling() {
  clearInterval(googleCalendarPollTimer);
  let attempts = 0;
  googleCalendarPollTimer = setInterval(async () => {
    attempts += 1;
    await loadGoogleCalendarStatus({ render: true });
    if (googleCalendarStatus?.connected) {
      clearInterval(googleCalendarPollTimer);
      googleCalendarPollTimer = null;
      if (els.saveStatus) els.saveStatus.textContent = "Google Calendar connected";
      syncGoogleCalendar();
    } else if (attempts > 30) {
      clearInterval(googleCalendarPollTimer);
      googleCalendarPollTimer = null;
    }
  }, 2000);
}

async function syncGoogleCalendar() {
  if (googleCalendarSyncing) return;
  googleCalendarSyncing = true;
  if (els.saveStatus) els.saveStatus.textContent = "Syncing Google Calendar...";
  renderCalendarConnectionsSurface();
  try {
    const response = await fetch("/api/google-calendar/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Google Calendar sync failed.");
    state.calendarEvents = normalizeCalendarEvents(result.events || []);
    googleCalendarStatus = result.status || googleCalendarStatus;
    saveLocal();
    renderSidePanel();
    renderCalendarConnectionsSurface();
    resetAppHistory();
    if (els.saveStatus) els.saveStatus.textContent = googleSyncSummary(result);
  } catch (error) {
    if (els.saveStatus) els.saveStatus.textContent = error.message || "Google Calendar sync failed";
  } finally {
    googleCalendarSyncing = false;
    renderCalendarConnectionsSurface();
  }
}

// The sync does two things now, and a line that only ever counts imports is how
// a push that never ran looked like a working sync for a month.
function googleSyncSummary(result) {
  const parts = [`Synced ${result.imported || 0} in`];
  const pushed = result.pushed || {};
  const out = (pushed.created || 0) + (pushed.updated || 0);
  if (out || pushed.deleted) parts.push(`${out} out${pushed.deleted ? `, ${pushed.deleted} removed` : ""}`);
  else if (result.pushSkipped === "reauthorize") parts.push("push off (reconnect Google to allow writing)");
  else parts.push("nothing to push");
  if (pushed.failed) parts.push(`${pushed.failed} failed`);
  return parts.join(" - ");
}

async function disconnectGoogleCalendar() {
  if (!confirm("Disconnect Google Calendar from this app? Imported events already saved locally will stay until the next local edit or manual cleanup.")) return;
  try {
    const response = await fetch("/api/google-calendar/disconnect", { method: "POST" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not disconnect Google Calendar.");
    googleCalendarStatus = result.status;
    if (els.saveStatus) els.saveStatus.textContent = "Google Calendar disconnected";
    renderCalendarConnectionsSurface();
  } catch (error) {
    if (els.saveStatus) els.saveStatus.textContent = error.message || "Could not disconnect Google Calendar";
  }
}

async function loadOutlookCalendarStatus(options = {}) {
  try {
    const response = await fetch("/api/outlook-calendar/status");
    if (!response.ok) return;
    outlookCalendarStatus = await response.json();
    if (options.render) renderCalendarConnectionsSurface();
  } catch {
    outlookCalendarStatus = null;
  }
}

async function saveOutlookCalendarConfig(form) {
  const data = new FormData(form);
  const response = await fetch("/api/outlook-calendar/config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: data.get("clientId"),
      clientSecret: data.get("clientSecret"),
      tenant: data.get("tenant") || "common",
      calendarId: data.get("calendarId") || "primary",
      lookbackDays: data.get("lookbackDays") || 30,
      lookaheadDays: data.get("lookaheadDays") || 180
    })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Could not save Outlook Calendar settings.");
  outlookCalendarStatus = result.status;
  if (els.saveStatus) els.saveStatus.textContent = "Outlook Calendar settings saved";
  return result;
}

async function connectOutlookCalendar(form = null) {
  try {
    if (form) await saveOutlookCalendarConfig(form);
    const response = await fetch("/api/outlook-calendar/connect", { method: "POST" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not start Outlook Calendar connection.");
    window.open(result.authUrl, "outlook-calendar-oauth", "width=720,height=760");
    if (els.saveStatus) els.saveStatus.textContent = "Finish Microsoft sign-in in the new window";
    startOutlookCalendarStatusPolling();
  } catch (error) {
    if (els.saveStatus) els.saveStatus.textContent = error.message || "Outlook Calendar connection failed";
  }
}

function startOutlookCalendarStatusPolling() {
  clearInterval(outlookCalendarPollTimer);
  let attempts = 0;
  outlookCalendarPollTimer = setInterval(async () => {
    attempts += 1;
    await loadOutlookCalendarStatus({ render: true });
    if (outlookCalendarStatus?.connected) {
      clearInterval(outlookCalendarPollTimer);
      outlookCalendarPollTimer = null;
      if (els.saveStatus) els.saveStatus.textContent = "Outlook Calendar connected";
      syncOutlookCalendar();
    } else if (attempts > 30) {
      clearInterval(outlookCalendarPollTimer);
      outlookCalendarPollTimer = null;
    }
  }, 2000);
}

async function syncOutlookCalendar() {
  if (outlookCalendarSyncing) return;
  outlookCalendarSyncing = true;
  if (els.saveStatus) els.saveStatus.textContent = "Syncing Outlook Calendar...";
  renderCalendarConnectionsSurface();
  try {
    const response = await fetch("/api/outlook-calendar/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Outlook Calendar sync failed.");
    state.calendarEvents = normalizeCalendarEvents(result.events || []);
    outlookCalendarStatus = result.status || outlookCalendarStatus;
    saveLocal();
    renderSidePanel();
    renderCalendarConnectionsSurface();
    resetAppHistory();
    if (els.saveStatus) els.saveStatus.textContent = `Synced ${result.imported || 0} Outlook events`;
  } catch (error) {
    if (els.saveStatus) els.saveStatus.textContent = error.message || "Outlook Calendar sync failed";
  } finally {
    outlookCalendarSyncing = false;
    renderCalendarConnectionsSurface();
  }
}

async function disconnectOutlookCalendar() {
  if (!confirm("Disconnect Outlook Calendar from this app? Imported events already saved locally will stay until the next local edit or manual cleanup.")) return;
  try {
    const response = await fetch("/api/outlook-calendar/disconnect", { method: "POST" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not disconnect Outlook Calendar.");
    outlookCalendarStatus = result.status;
    if (els.saveStatus) els.saveStatus.textContent = "Outlook Calendar disconnected";
    renderCalendarConnectionsSurface();
  } catch (error) {
    if (els.saveStatus) els.saveStatus.textContent = error.message || "Could not disconnect Outlook Calendar";
  }
}

/* --- Spotify listening log ----------------------------------------------------
   The log itself is written by a timer in server.cjs; this is only the settings
   panel that connects the account and shows the last few plays as proof it is
   working. Nothing here is on any capture path. */

async function loadSpotifyStatus(options = {}) {
  try {
    const response = await fetch("/api/spotify/status");
    if (!response.ok) return;
    spotifyStatus = await response.json();
    if (options.render && activeView === "settings") renderSettingsView();
  } catch {
    spotifyStatus = null;
  }
}

async function saveSpotifyConfig(form) {
  const data = new FormData(form);
  const response = await fetch("/api/spotify/config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId: data.get("clientId"), clientSecret: data.get("clientSecret") })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Could not save Spotify settings.");
  spotifyStatus = { ...(spotifyStatus || {}), ...result.status };
  if (els.saveStatus) els.saveStatus.textContent = "Spotify settings saved";
  return result;
}

async function connectSpotify(form = null) {
  try {
    if (form) await saveSpotifyConfig(form);
    const response = await fetch("/api/spotify/connect", { method: "POST" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not start Spotify connection.");
    window.open(result.authUrl, "spotify-oauth", "width=720,height=760");
    if (els.saveStatus) els.saveStatus.textContent = "Finish Spotify sign-in in the new window";
    startSpotifyStatusPolling();
  } catch (error) {
    if (els.saveStatus) els.saveStatus.textContent = error.message || "Spotify connection failed";
  }
}

function startSpotifyStatusPolling() {
  clearInterval(spotifyPollTimer);
  let attempts = 0;
  const wasConnectedAt = spotifyStatus?.lastConnectedAt || null;
  spotifyPollTimer = setInterval(async () => {
    attempts += 1;
    await loadSpotifyStatus({ render: true });
    // "connected" is already true on a reconnect, so watch for the sync the
    // callback kicks off instead: lastSyncAt moving is the sign it went through.
    const done = spotifyStatus?.connected && !spotifyStatus?.needsReconnect
      && (!wasConnectedAt || spotifyStatus?.lastSyncAt);
    if (done) {
      clearInterval(spotifyPollTimer);
      spotifyPollTimer = null;
      if (els.saveStatus) els.saveStatus.textContent = "Spotify connected";
    } else if (attempts > 45) {
      clearInterval(spotifyPollTimer);
      spotifyPollTimer = null;
    }
  }, 2000);
}

async function syncSpotify() {
  if (spotifySyncing) return;
  spotifySyncing = true;
  if (els.saveStatus) els.saveStatus.textContent = "Fetching recent Spotify plays...";
  if (activeView === "settings") renderSettingsView();
  try {
    const response = await fetch("/api/spotify/sync", { method: "POST" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Spotify fetch failed.");
    await loadSpotifyStatus();
    if (els.saveStatus) els.saveStatus.textContent = `Logged ${result.added || 0} new Spotify plays (${result.total || 0} total)`;
  } catch (error) {
    await loadSpotifyStatus();
    if (els.saveStatus) els.saveStatus.textContent = error.message || "Spotify fetch failed";
  } finally {
    spotifySyncing = false;
    if (activeView === "settings") renderSettingsView();
  }
}

async function disconnectSpotify() {
  if (!confirm("Disconnect Spotify from this app? The plays already logged stay on disk.")) return;
  try {
    const response = await fetch("/api/spotify/disconnect", { method: "POST" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not disconnect Spotify.");
    spotifyStatus = { ...(spotifyStatus || {}), ...result.status, recent: [], nowPlaying: null };
    if (els.saveStatus) els.saveStatus.textContent = "Spotify disconnected";
    if (activeView === "settings") renderSettingsView();
  } catch (error) {
    if (els.saveStatus) els.saveStatus.textContent = error.message || "Could not disconnect Spotify";
  }
}

function saveCalendarEvents() {
  ensureCalendarState();
  // Belt and braces: ensureCalendarState() already replaces the array, so the
  // identity check would catch this anyway. Explicit here so a future in-place
  // edit on this path cannot leave a stale index behind.
  invalidatePlanEventIndex();
  saveLocal();
  postCalendarEvents(state.calendarEvents);
}

/* The server refuses a write that would strip most of the calendar off the disk.
   That refusal has to be loud. This function used to swallow every failure on the
   grounds that localStorage was the fallback -- but the calendar is the one thing
   localStorage does not hold, so a silently dropped POST left the day looking
   saved and the disk unchanged.

   A refusal is not automatically wrong: a genuine bulk delete trips the same
   wire. So it asks, and only a yes re-sends with force. Anything the user does
   not confirm is still recoverable from backups/rejected/. */
async function postCalendarEvents(events, options = {}) {
  // The server's guard is the backstop; this is the front door. If the calendar
  // never loaded, whatever is in memory is not a version of the user's data and
  // must not reach the disk under any circumstances -- not even with force.
  if (!calendarEventsLoaded) {
    if (els.saveStatus) {
      els.saveStatus.textContent = "Calendar not saved — it never loaded from the server. Reload before editing.";
    }
    return;
  }
  let response = null;
  try {
    response = await fetch("/api/calendar-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events, force: options.force === true })
    });
  } catch {
    // Server unreachable. Local storage remains the immediate fallback, and the
    // status line already says "Saved locally" rather than "Saved".
    return;
  }
  if (response.ok || options.force) return;
  if (response.status !== 409) return;
  let details = null;
  try {
    details = await response.json();
  } catch {
    return;
  }
  if (details?.code !== "data-write-guard") return;
  const message =
    `This change would delete ${details.lost} of the ${details.before} events on disk, leaving ${details.after}.\n\n` +
    `The save was refused and nothing has changed. If the server restarted while this window was open, ` +
    `reload the page instead of confirming — the calendar you are looking at may be empty.\n\n` +
    `Delete them anyway?`;
  if (!window.confirm(message)) {
    if (els.saveStatus) els.saveStatus.textContent = "Calendar save refused — disk copy kept, your version is in backups/rejected";
    return;
  }
  await postCalendarEvents(events, { force: true });
}

/* --- Task sync cadence ------------------------------------------------------

   1.5 s is the rate the visible task list needs: the HUD and the capture scripts
   write tasks behind the app's back, and a slower poll shows stale checkboxes
   while you watch. A hidden tab needs none of that -- nothing is on screen to go
   stale -- and on the phone each poll is a radio wake, so a backgrounded PWA was
   paying for a list nobody could see.

   Backing off rather than stopping keeps the merge in mergeTasksFromServer()
   working on the same small deltas it always has. Coming back to the foreground
   polls immediately, so the list is current by the time it is looked at.
--------------------------------------------------------------------------- */

const TASK_SYNC_ACTIVE_MS = 1500;
const TASK_SYNC_HIDDEN_MS = 15000;
let taskSyncIntervalMs = 0;

function taskSyncIntervalFor() {
  return document.hidden ? TASK_SYNC_HIDDEN_MS : TASK_SYNC_ACTIVE_MS;
}

function startTaskSync() {
  if (taskSyncTimer) return;
  taskSyncIntervalMs = taskSyncIntervalFor();
  taskSyncTimer = setInterval(syncTasksFromDisk, taskSyncIntervalMs);
}

function applyTaskSyncCadence() {
  if (!taskSyncTimer) return;
  const next = taskSyncIntervalFor();
  if (next === taskSyncIntervalMs) return;
  clearInterval(taskSyncTimer);
  taskSyncIntervalMs = next;
  taskSyncTimer = setInterval(syncTasksFromDisk, taskSyncIntervalMs);
  // The immediate catch-up poll on the way back belongs to the visibilitychange
  // handler in wireEvents(), which already runs one.
}

async function syncTasksFromDisk() {
  if (!state.currentDate) return;
  if (shouldDeferTaskSync()) return;
  try {
    const viewDate = state.currentDate;
    const actualDate = todayISO();
    const dates = [...new Set([viewDate, actualDate])];
    const responses = await Promise.all(dates.map((date) => fetch(`/api/tasks?date=${encodeURIComponent(date)}`)));
    if (responses.some((response) => !response.ok)) return;
    const payloads = await Promise.all(responses.map((response) => response.json()));
    if (shouldDeferTaskSync()) return;
    if (state.currentDate !== viewDate) return;
    const actualDateChanged = lastKnownActualDate !== actualDate;
    lastKnownActualDate = actualDate;
    let tasksChanged = false;
    let entryMetadataChanged = false;
    for (let index = 0; index < dates.length; index += 1) {
      const date = dates[index];
      const nextTasks = payloads[index]?.tasks;
      if (!nextTasks) continue;
      ensureEntry(date);
      const entry = state.entries[date];
      ensureTaskState(entry);
      const nextRevision = Number(payloads[index]?.revision);
      const knownBase = entryBaseSnapshots.get(date);
      // Three-way, never a plain assignment: the disk copy cannot be assumed to
      // contain tasks added here since the last successful save. See
      // mergeTasksFromServer().
      const mergedTasks = mergeTasksFromServer(knownBase?.tasks, entry.tasks, nextTasks);
      const tasksDiffer = !sameValue(entry.tasks, mergedTasks);
      // The revision may only be adopted when this poll can account for
      // everything in it. tasks and mistakes ride on the payload and are merged
      // below; the fingerprint covers the rest. Comparing it against the base
      // snapshot -- what this client last knew the server held -- rather than
      // the live entry is deliberate, so unsaved local edits do not count as a
      // remote change.
      //
      // When it does not match, another writer (the other window, or the phone)
      // changed a field this poll cannot see. Staying stale is the fix: the next
      // whole-entry save then takes the 409 path, and mergeEntryVersions() keeps
      // the remote value for anything this client never touched. Adopting it
      // regardless is how a night-survey `naps` value was lost.
      const restInSync =
        typeof payloads[index]?.restFingerprint === "string" &&
        Boolean(knownBase) &&
        entrySyncFingerprint(knownBase) === payloads[index].restFingerprint;
      const revisionDiffers =
        Number.isInteger(nextRevision) &&
        nextRevision >= 0 &&
        entryRevision(entry) !== nextRevision &&
        restInSync;
      // Must happen before the revision is adopted below. Once the entry stops
      // looking stale, a whole-entry save no longer goes through the 409 merge,
      // so anything the server holds and this client does not would be
      // overwritten -- which is exactly how externally captured mistakes got
      // wiped before mistakes were carried on this payload.
      const mistakesAdded = mergeMistakesFromServer(entry, payloads[index]?.mistakes);
      if (mistakesAdded) mistakesRenderPending = true;
      if (tasksDiffer) {
        entry.tasks = mergedTasks;
        tasksChanged = true;
      }
      if (revisionDiffers) {
        entry._revision = nextRevision;
        entry._savedAt = payloads[index]?.savedAt || entry._savedAt || null;
        entryMetadataChanged = true;
      }
      // The last clause matters even when the merge changed nothing locally: the
      // base is what the next merge measures a local add against, so it has to
      // track the disk list whenever that moves.
      if (tasksDiffer || revisionDiffers || mistakesAdded || !sameValue(knownBase?.tasks, nextTasks)) {
        const base = entryBaseSnapshots.get(date) || cloneValue(entry);
        base.tasks = cloneValue(nextTasks);
        base.mistakes = cloneValue(entry.mistakes);
        base._revision = entryRevision(entry);
        base._savedAt = entry._savedAt || null;
        entryBaseSnapshots.set(date, base);
      }
    }
    // Re-rendering the mistakes grid would pull the focus out of a half-typed
    // column, so the merged rows wait for a tick where nothing is being edited.
    if (mistakesRenderPending && !isMistakeTextEditing()) {
      mistakesRenderPending = false;
      if (activeView === "mistakes") renderMistakesView();
      renderMistakesOutput();
      renderMissingOutput();
    }
    // Midnight passed with the app left open: yesterday's goal tasks expire and
    // today's are materialised here, since nothing else reloads the page.
    if (actualDateChanged) refreshDailyGoalTasks();
    if (!actualDateChanged && !tasksChanged && !entryMetadataChanged) return;
    saveLocal();
    renderSidePanel();
    if (activeView === "tasks") renderTasksView();
    renderCompletedOutput();
  } catch {
    // The local in-memory task list remains usable if the server is unavailable.
  }
}

/* --- Task merge on poll -----------------------------------------------------

   syncTasksFromDisk() used to do `entry.tasks = nextTasks` outright, which threw
   away every task added or edited since the last successful save. Add a task and
   TASK_SYNC_DEFER_MS later the poll replaced the list with a disk copy that had
   never received it. Whenever a save was not landing -- a 409 the merge could not
   resolve, or the server briefly unreachable -- tasks added in that window simply
   vanished from "Do right now", which is the bug this replaced.

   So tasks now take the same three-way shape as the rest of the entry: base
   (what this client last knew the server held) against local against disk,
   reconciled per section by task id. The base is the load-bearing part -- only it
   can tell an unsaved local add from a task the server has since removed.
--------------------------------------------------------------------------- */

function mergeTasksFromServer(baseTasks, localTasks, serverTasks) {
  if (!isPlainObject(serverTasks)) return cloneValue(localTasks);
  // With no base, an unsaved local add and a task the server has removed look
  // identical, so the disk copy stands. entryBaseSnapshots is seeded on load and
  // after every save and poll, so this is only the cold-start case.
  if (!isPlainObject(baseTasks)) return cloneValue(serverTasks);
  const merged = {};
  const sections = new Set([
    ...TASK_SECTION_KEYS,
    "completed",
    "discarded",
    ...Object.keys(serverTasks),
    ...Object.keys(isPlainObject(localTasks) ? localTasks : {})
  ]);
  for (const section of sections) {
    merged[section] = mergeTaskList(baseTasks[section], localTasks?.[section], serverTasks[section]);
  }
  return merged;
}

function mergeTaskList(baseList, localList, serverList) {
  const base = Array.isArray(baseList) ? baseList : [];
  const local = Array.isArray(localList) ? localList : [];
  const server = Array.isArray(serverList) ? serverList : [];
  if (sameValue(local, server)) return cloneValue(server);
  if (sameValue(local, base)) return cloneValue(server); // nothing local to protect
  if (sameValue(server, base)) return cloneValue(local); // nothing remote to adopt
  const withId = (list) => list.filter((task) => task?.id);
  const baseById = new Map(withId(base).map((task) => [task.id, task]));
  const localById = new Map(withId(local).map((task) => [task.id, task]));
  const serverIds = new Set(withId(server).map((task) => task.id));
  // Disk order wins for tasks both sides already know about: a reorder is a
  // whole-list change with no per-task marker, and the HUD reads the first
  // rightNow task, so the two sides must not each keep their own order.
  const result = [];
  for (const task of server) {
    const id = task?.id;
    if (!id) {
      result.push(cloneValue(task));
      continue;
    }
    // Completed or deleted here while the save was still in flight or failing.
    if (baseById.has(id) && !localById.has(id)) continue;
    const localTask = localById.get(id);
    if (!localTask) {
      result.push(cloneValue(task)); // added by the HUD or the other window
      continue;
    }
    const mergedTask = mergeEntryVersions(baseById.get(id), localTask, task);
    result.push(mergedTask.conflicts.length ? cloneValue(localTask) : mergedTask.value);
  }
  // Added here since the last successful save: absent from the disk copy and
  // never in the base, so an addition rather than a remote removal.
  local.forEach((task, index) => {
    const id = task?.id;
    if (!id || serverIds.has(id) || baseById.has(id)) return;
    // Keep the position the user chose -- quick-add puts a rightNow task at the
    // front, and the HUD reads that first row.
    let insertAt = 0;
    for (let scan = index - 1; scan >= 0; scan -= 1) {
      const previousId = local[scan]?.id;
      const at = previousId ? result.findIndex((item) => item?.id === previousId) : -1;
      if (at !== -1) {
        insertAt = at + 1;
        break;
      }
    }
    result.splice(insertAt, 0, cloneValue(task));
  });
  return result;
}

// Append-only merge: the capture window can only add rows, so a row this client
// does not have is always new. Rows deleted here stay deleted even if a poll
// races the save that removes them server-side.
function mergeMistakesFromServer(entry, incoming) {
  if (!Array.isArray(incoming)) return false;
  ensureMistakeState(entry);
  const known = new Set(entry.mistakes.map((mistake) => mistake.id));
  let added = false;
  for (const mistake of incoming) {
    if (!mistake?.id || known.has(mistake.id) || removedMistakeIds.has(mistake.id)) continue;
    entry.mistakes.push(normalizeMistake(mistake));
    known.add(mistake.id);
    added = true;
  }
  return added;
}

function isMistakeTextEditing() {
  const active = document.activeElement;
  if (!active) return false;
  return Boolean(active.closest?.("#mistakesView, #mistakesOutput") && active.matches?.("input, textarea"));
}

function deferTaskSync() {
  taskSyncPausedUntil = Math.max(taskSyncPausedUntil, Date.now() + TASK_SYNC_DEFER_MS);
}

function isTaskTextEditing() {
  const active = document.activeElement;
  if (!active) return false;
  if (active.dataset?.taskEditor) return true;
  return Boolean(active.closest?.("#tasksView") && active.matches?.("input, textarea, select, [contenteditable='true']"));
}

function shouldDeferTaskSync() {
  // A re-render mid-drag would tear the dragged row out of the DOM.
  return Boolean(taskDragState) || isTaskTextEditing() || Date.now() < taskSyncPausedUntil;
}

function taskId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Capped at a day: an estimate longer than the calendar can show is a typo, and
// the placement preview has to stay inside the grid.
function normalizeEstimateMinutes(value) {
  const minutes = Math.round(Number(value) || 0);
  if (!Number.isFinite(minutes) || minutes <= 0) return 0;
  return Math.min(minutes, 1440);
}

// The calendar category letter a task is filed under, or "" for undecided.
// Same code list as calendar events, because the whole point is that the block
// a task drops as needs no second edit.
function normalizeCalendarCategory(value) {
  const code = String(value || "").trim().toUpperCase();
  return CALENDAR_CATEGORIES.some((category) => category.code === code) ? code : "";
}

function normalizeTask(task, sectionKey) {
  const source = task && typeof task === "object" ? task : {};
  const labels = Array.isArray(source.labels) ? source.labels : [];
  const dueDate = /^\d{4}-\d{2}-\d{2}$/.test(String(source.dueDate || "")) ? source.dueDate : "";
  return {
    id: source.id || taskId(),
    text: String(source.text || ""),
    // Set on tasks materialised from a daily goal, so completing the task can be
    // recorded against that goal in goal-log.json. Empty for hand-made tasks.
    goalId: String(source.goalId || "").trim(),
    // The last date this task is for. Set on materialised daily-goal tasks, which
    // are worthless the day after: 15 LinkedIn points cannot be earned yesterday,
    // and a plan for a day that already happened is not a plan. Blank means the
    // task carries forward indefinitely, which is the default for everything the
    // user types themselves.
    expiresOn: /^\d{4}-\d{2}-\d{2}$/.test(String(source.expiresOn || "")) ? source.expiresOn : "",
    // How long the task is expected to take. Its only job is to size the block
    // dropped on the calendar, so 0 means "not estimated", not "instant".
    estimateMinutes: normalizeEstimateMinutes(source.estimateMinutes),
    // Which category the block dropped on the calendar is filed under. Decided
    // once -- on the goal, or on the row -- so placing a task is a single click
    // and the hours it feeds are already the right colour. "" falls back to the
    // keyword guess; see taskCalendarCategory().
    calendarCategory: normalizeCalendarCategory(source.calendarCategory),
    project: String(source.project || "").trim(),
    labels: labels.map((label) => String(label || "").trim()).filter(Boolean),
    priority: ["p1", "p2", "p3", "p4"].includes(source.priority) ? source.priority : "p4",
    dueDate,
    // HH:MM the task is meant to start, set by quick-add ("2pm", "at 3"). It is
    // advisory: it seeds the placement bubble so the block lands where it was
    // meant to, but the calendar event stays the record of when the work is
    // actually booked. Mirrored in server.cjs -- a field missing from either
    // normalizeTask() is dropped on the next save.
    dueTime: /^([01]\d|2[0-3]):[0-5]\d$/.test(String(source.dueTime || "")) ? String(source.dueTime) : "",
    createdAt: source.createdAt || new Date().toISOString(),
    updatedAt: source.updatedAt || null,
    source: source.source || sectionKey || "inbox",
    sourceDate: /^\d{4}-\d{2}-\d{2}$/.test(String(source.sourceDate || "")) ? source.sourceDate : "",
    previousIndex: source.previousIndex,
    completedAt: source.completedAt || null,
    // Which surface checked the task off: "app" here, "hud" from task-hud.ps1 via
    // /api/tasks/complete. Null on anything completed before this was tracked, so
    // any comparison of the two has to start from the date the field appears.
    completedVia: TASK_COMPLETION_SURFACES.includes(source.completedVia) ? source.completedVia : null,
    discardedAt: source.discardedAt || null
  };
}

function sectionForTask(task, fallback = "inbox") {
  const today = state.currentDate || todayISO();
  if (task.section && TASK_SECTION_KEYS.includes(task.section)) return task.section;
  if (task.dueDate === today) return "today";
  if (task.dueDate && task.dueDate > today) return "upcoming";
  return TASK_SECTION_KEYS.includes(fallback) ? fallback : "inbox";
}

const TASK_MONTHS = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11
};
const TASK_WEEKDAYS = {
  sun: 0,
  sunday: 0,
  mon: 1,
  monday: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  wed: 3,
  weds: 3,
  wednesday: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6
};

/* --- Quick add --------------------------------------------------------------

   Todoist-shaped: everything the row needs can be typed in one line, and what
   the parser recognised is shown back before the row is created.

     write the quarterly brief 90m tomorrow 2pm /W #report @deep p1

   `#project`, `@label`, `p1`-`p4` and the date words were already here. New are
   a length (`90m`, `1h30`, `2 hours`), a start time (`2pm`, `14:30`, `at 3`),
   and a calendar category (`/W`, `/work`) so a placed block is coloured and
   counted without a second edit.

   Every recognition is also returned as a token, keyed by kind and position,
   and `options.disabled` turns any of them back into plain words. That is what
   makes the chips under the field a control rather than a readout: the parser
   is the only thing that decides what a word means, and the UI just tells it
   which decisions to drop.
--------------------------------------------------------------------------- */

const TASK_DURATION_UNIT = /^(h|hr|hrs|hour|hours|m|min|mins|minute|minutes)$/i;
const TASK_DURATION_PATTERN = /^(\d+(?:\.\d+)?)(h|hr|hrs|hour|hours|m|min|mins|minute|minutes)$/i;
const TASK_HOUR_MINUTE_PATTERN = /^(\d{1,2})h(\d{1,2})m?$/i;
const TASK_MERIDIEM_PATTERN = /^(\d{1,2})(?::(\d{2}))?(am|pm)$/i;
const TASK_CLOCK_PATTERN = /^(\d{1,2}):(\d{2})$/;
// A bare hour after "at" is read as the working day rather than the small
// hours: "at 3" is an afternoon meeting, not 03:00.
const TASK_BARE_HOUR_PM_BELOW = 8;

function parseTaskInput(text, fallbackSection = "inbox", options = {}) {
  const disabled = options.disabled instanceof Set ? options.disabled : new Set();
  const tokens = String(text || "").trim().split(/\s+/).filter(Boolean);
  const consumed = Array(tokens.length).fill(false);
  const recognised = [];
  const labels = [];
  let project = "";
  let priority = "p4";
  let dueDate = "";
  let dueTime = "";
  let estimateMinutes = 0;
  let calendarCategory = "";
  let section = fallbackSection;
  const baseDate = state.currentDate || todayISO();

  // Records what was recognised and reports whether it should take effect. A
  // token the caller has switched off is still listed -- that is how the chip
  // stays on screen to be switched back on -- it just consumes nothing.
  const claim = (kind, indexes, describe) => {
    const key = `${kind}:${indexes.join("-")}`;
    const off = disabled.has(key);
    recognised.push({
      key,
      kind,
      off,
      text: indexes.map((index) => tokens[index]).join(" "),
      label: describe
    });
    if (off) return false;
    indexes.forEach((index) => {
      consumed[index] = true;
    });
    return true;
  };

  for (let index = 0; index < tokens.length; index += 1) {
    if (consumed[index]) continue;
    const normalized = normalizedTaskToken(tokens[index]);
    if (/^@[a-z0-9_-]+$/i.test(normalized)) {
      if (claim("label", [index], `label ${normalized.slice(1)}`)) labels.push(normalized.slice(1));
      continue;
    }
    if (/^#[\w-]+$/i.test(normalized)) {
      if (claim("project", [index], `project ${normalized.slice(1)}`)) project = normalized.slice(1);
      continue;
    }
    if (/^(?:p[1-4]|![1-4]|!p[1-4])$/i.test(normalized)) {
      const value = `p${normalized.match(/[1-4]/)[0]}`;
      if (claim("priority", [index], `priority ${value.toUpperCase()}`)) priority = value;
      continue;
    }

    const category = parseTaskCategoryAt(tokens, index);
    if (category) {
      if (claim("category", category.indexes, `category ${trendsCategoryLabel(category.code)}`)) {
        calendarCategory = category.code;
      }
      continue;
    }

    const duration = parseTaskDurationAt(tokens, index);
    if (duration) {
      if (claim("estimate", duration.indexes, `estimate ${formatEstimate(duration.minutes)}`)) {
        estimateMinutes = duration.minutes;
      }
      continue;
    }

    const time = parseTaskTimeAt(tokens, index);
    if (time) {
      if (claim("time", time.indexes, `at ${formatClockFromTime(time.time)}`)) dueTime = time.time;
      continue;
    }

    const next = normalizedTaskToken(tokens[index + 1]);
    const previous = normalizedTaskToken(tokens[index - 1]);
    const priorityWord = taskPriorityFromWord(normalized);
    if (normalized === "priority" && next && taskPriorityFromWord(next)) {
      const value = taskPriorityFromWord(next);
      if (claim("priority", [index, index + 1], `priority ${value.toUpperCase()}`)) priority = value;
      continue;
    }
    if (priorityWord && next === "priority") {
      if (claim("priority", [index, index + 1], `priority ${priorityWord.toUpperCase()}`)) priority = priorityWord;
      continue;
    }
    if (priorityWord && previous === "priority") {
      if (claim("priority", [index], `priority ${priorityWord.toUpperCase()}`)) priority = priorityWord;
      continue;
    }
    if (["now", "!now"].includes(normalized)) {
      if (claim("section", [index], "right now")) section = "rightNow";
      continue;
    }
    if (normalized === "right" && next === "now") {
      if (claim("section", [index, index + 1], "right now")) section = "rightNow";
      continue;
    }
  }

  for (let index = 0; index < tokens.length; index += 1) {
    if (consumed[index] || dueDate) continue;
    const parsed = parseTaskDateAt(tokens, index, baseDate);
    if (!parsed) continue;
    if (!claim("date", parsed.indexes, formatShortDate(parsed.date))) continue;
    dueDate = parsed.date;
    section = dueDate === baseDate ? "today" : "upcoming";
  }

  const title = tokens.filter((_, index) => !consumed[index]);
  const task = normalizeTask({
    text: title.join(" "),
    project,
    labels,
    priority,
    dueDate,
    dueTime,
    estimateMinutes,
    calendarCategory,
    createdAt: new Date().toISOString()
  }, section);
  return { task, section: sectionForTask(task, section), tokens: recognised };
}

function parseTaskCategoryAt(tokens, index) {
  const raw = String(tokens[index] || "");
  if (!raw.startsWith("/")) return null;
  const word = raw.slice(1).replace(/[.,;:!?)\]}'"]+$/, "");
  if (!word) return null;
  const byCode = CALENDAR_CATEGORIES.find((category) => category.code === word.toUpperCase());
  if (byCode) return { code: byCode.code, indexes: [index] };
  // A prefix of the label is enough -- "/exer" is unambiguous and "/Hobbies and
  // Skills" cannot be typed as one token anyway.
  const byLabel = CALENDAR_CATEGORIES.find((category) => normalize(category.label).startsWith(normalize(word)));
  return byLabel && word.length >= 3 ? { code: byLabel.code, indexes: [index] } : null;
}

function parseTaskDurationAt(tokens, index) {
  const word = normalizedTaskToken(tokens[index]);
  // "in 2 hours" says when, not how long. Left for the date/time parsers.
  if (normalizedTaskToken(tokens[index - 1]) === "in") return null;
  const asMinutes = (amount, unit) => {
    const minutes = Math.round(/^h/i.test(unit) ? Number(amount) * 60 : Number(amount));
    return minutes > 0 && minutes <= 1440 ? minutes : null;
  };
  const withFor = (indexes) =>
    (normalizedTaskToken(tokens[indexes[0] - 1]) === "for" ? [indexes[0] - 1, ...indexes] : indexes);

  const combined = TASK_HOUR_MINUTE_PATTERN.exec(word);
  if (combined) {
    const minutes = Number(combined[1]) * 60 + Number(combined[2]);
    return minutes > 0 && minutes <= 1440 ? { minutes, indexes: withFor([index]) } : null;
  }
  const single = TASK_DURATION_PATTERN.exec(word);
  if (single) {
    const minutes = asMinutes(single[1], single[2]);
    return minutes ? { minutes, indexes: withFor([index]) } : null;
  }
  const next = normalizedTaskToken(tokens[index + 1]);
  if (/^\d+(?:\.\d+)?$/.test(word) && TASK_DURATION_UNIT.test(next)) {
    const minutes = asMinutes(word, next);
    return minutes ? { minutes, indexes: withFor([index, index + 1]) } : null;
  }
  return null;
}

function parseTaskTimeAt(tokens, index) {
  const word = normalizedTaskToken(tokens[index]);
  const prefixed = ["at", "@"].includes(normalizedTaskToken(tokens[index - 1]));
  const indexes = prefixed ? [index - 1, index] : [index];
  const clock = (hour, minute) => `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  const meridiem = TASK_MERIDIEM_PATTERN.exec(word);
  if (meridiem) {
    const hour = Number(meridiem[1]) % 12;
    const minute = Number(meridiem[2] || 0);
    if (Number(meridiem[1]) > 12 || minute > 59) return null;
    return { time: clock(/pm/i.test(meridiem[3]) ? hour + 12 : hour, minute), indexes };
  }
  const digits = TASK_CLOCK_PATTERN.exec(word);
  if (digits && Number(digits[1]) <= 23 && Number(digits[2]) <= 59) {
    return { time: clock(Number(digits[1]), Number(digits[2])), indexes };
  }
  // A bare number is only a time when "at" said so; otherwise "call 3 people"
  // would become a 3am task.
  if (prefixed && /^\d{1,2}$/.test(word)) {
    const hour = Number(word);
    if (hour < 1 || hour > 23) return null;
    return { time: clock(hour < TASK_BARE_HOUR_PM_BELOW ? hour + 12 : hour, 0), indexes };
  }
  return null;
}

function normalizedTaskToken(token) {
  return String(token || "")
    .replace(/^[([{'"`]+/, "")
    .replace(/[.,;:!?)}\]'"`]+$/, "")
    .toLowerCase();
}

function taskPriorityFromWord(word) {
  if (["urgent", "highest", "high"].includes(word)) return "p1";
  if (["medium", "med", "normal"].includes(word)) return "p2";
  if (["low"].includes(word)) return "p3";
  if (["none", "no", "lowest"].includes(word)) return "p4";
  return "";
}

function parseTaskDateAt(tokens, index, baseDate) {
  const word = normalizedTaskToken(tokens[index]);
  const next = normalizedTaskToken(tokens[index + 1]);
  const third = normalizedTaskToken(tokens[index + 2]);
  const fourth = normalizedTaskToken(tokens[index + 3]);
  const prefixWords = ["due", "by", "on"];
  if (prefixWords.includes(word)) {
    const parsed = parseTaskDateAt(tokens, index + 1, baseDate);
    if (parsed) return { date: parsed.date, indexes: [index, ...parsed.indexes] };
    return null;
  }

  if (["today", "tonight"].includes(word)) return { date: baseDate, indexes: [index] };
  if (word === "tomorrow" || (word === "tmr") || (word === "tmrw")) {
    return { date: shiftISODate(baseDate, 1), indexes: [index] };
  }
  if (word === "weekend") return { date: nextWeekendISO(baseDate), indexes: [index] };
  if (word === "next" && next === "week") return { date: shiftISODate(baseDate, 7), indexes: [index, index + 1] };
  if (word === "next" && next === "month") return { date: shiftMonthISO(baseDate, 1), indexes: [index, index + 1] };
  if (word === "next" && next === "weekend") return { date: nextWeekendISO(shiftISODate(baseDate, 7)), indexes: [index, index + 1] };
  if (word === "this" && next === "weekend") return { date: nextWeekendISO(baseDate), indexes: [index, index + 1] };
  if (word === "next" && TASK_WEEKDAYS[next] !== undefined) {
    return { date: nextWeekdayISO(baseDate, TASK_WEEKDAYS[next], true), indexes: [index, index + 1] };
  }
  if (word === "this" && TASK_WEEKDAYS[next] !== undefined) {
    return { date: nextWeekdayISO(baseDate, TASK_WEEKDAYS[next], false), indexes: [index, index + 1] };
  }
  if (word === "in" && /^\d+$/.test(next) && ["day", "days", "week", "weeks", "month", "months"].includes(third)) {
    const amount = Number(next);
    const date = third.startsWith("month") ? shiftMonthISO(baseDate, amount) : shiftISODate(baseDate, amount * (third.startsWith("week") ? 7 : 1));
    return { date, indexes: [index, index + 1, index + 2] };
  }
  if (TASK_WEEKDAYS[word] !== undefined) {
    return { date: nextWeekdayISO(baseDate, TASK_WEEKDAYS[word], false), indexes: [index] };
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(word)) return { date: word, indexes: [index] };

  const slashDate = parseSlashTaskDate(word, baseDate);
  if (slashDate) return { date: slashDate, indexes: [index] };

  if (TASK_MONTHS[word] !== undefined && /^\d{1,2}(st|nd|rd|th)?$/.test(next)) {
    const parsed = taskDateFromParts(baseDate, Number(next.replace(/\D/g, "")), TASK_MONTHS[word], /^\d{4}$/.test(third) ? Number(third) : null);
    if (parsed) return { date: parsed, indexes: /^\d{4}$/.test(third) ? [index, index + 1, index + 2] : [index, index + 1] };
  }
  if (/^\d{1,2}(st|nd|rd|th)?$/.test(word) && TASK_MONTHS[next] !== undefined) {
    const parsed = taskDateFromParts(baseDate, Number(word.replace(/\D/g, "")), TASK_MONTHS[next], /^\d{4}$/.test(third) ? Number(third) : null);
    if (parsed) return { date: parsed, indexes: /^\d{4}$/.test(third) ? [index, index + 1, index + 2] : [index, index + 1] };
  }
  if (TASK_MONTHS[next] !== undefined && word === "the" && /^\d{1,2}(st|nd|rd|th)?$/.test(third)) {
    const parsed = taskDateFromParts(baseDate, Number(third.replace(/\D/g, "")), TASK_MONTHS[next], /^\d{4}$/.test(fourth) ? Number(fourth) : null);
    if (parsed) return { date: parsed, indexes: /^\d{4}$/.test(fourth) ? [index, index + 1, index + 2, index + 3] : [index, index + 1, index + 2] };
  }
  return null;
}

function shiftISODate(dateString, days) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function shiftMonthISO(dateString, months) {
  const source = new Date(`${dateString}T12:00:00`);
  const day = source.getDate();
  const shifted = new Date(source);
  shifted.setMonth(shifted.getMonth() + months, 1);
  const lastDay = new Date(shifted.getFullYear(), shifted.getMonth() + 1, 0).getDate();
  shifted.setDate(Math.min(day, lastDay));
  return isoFromDate(shifted);
}

function nextWeekdayISO(dateString, targetDay, forceFuture) {
  const date = new Date(`${dateString}T12:00:00`);
  let delta = (targetDay - date.getDay() + 7) % 7;
  if (forceFuture && delta === 0) delta = 7;
  return shiftISODate(dateString, delta);
}

function nextWeekendISO(dateString) {
  return nextWeekdayISO(dateString, 6, false);
}

function parseSlashTaskDate(value, baseDate) {
  const match = String(value || "").match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2}|\d{4}))?$/);
  if (!match) return "";
  let year = match[3] ? Number(match[3]) : null;
  if (year && year < 100) year += 2000;
  return taskDateFromParts(baseDate, Number(match[2]), Number(match[1]) - 1, year);
}

function taskDateFromParts(baseDate, day, monthIndex, year) {
  if (!Number.isInteger(day) || !Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) return "";
  const base = new Date(`${baseDate}T12:00:00`);
  let resolvedYear = year || base.getFullYear();
  let date = new Date(resolvedYear, monthIndex, day, 12, 0, 0, 0);
  if (date.getFullYear() !== resolvedYear || date.getMonth() !== monthIndex || date.getDate() !== day) return "";
  if (!year && isoFromDate(date) < baseDate) {
    resolvedYear += 1;
    date = new Date(resolvedYear, monthIndex, day, 12, 0, 0, 0);
  }
  return isoFromDate(date);
}

function tasksFor(sectionKey) {
  return tasksForDate(state.currentDate, sectionKey);
}

function taskStorageDate(dateString, sectionKey) {
  if (sectionKey === "rightNow") return todayISO();
  return validTaskDate(dateString);
}

function tasksForDate(dateString, sectionKey) {
  const resolvedSection = TASK_SECTION_KEYS.includes(sectionKey) ? sectionKey : "inbox";
  const resolvedDate = taskStorageDate(dateString, resolvedSection);
  ensureEntry(resolvedDate);
  const entry = state.entries[resolvedDate];
  ensureTaskState(entry);
  return entry.tasks[resolvedSection];
}

function validTaskDate(dateString) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(dateString || "")) ? dateString : state.currentDate;
}

function taskRef(sectionKey, taskIdValue, dateString = state.currentDate) {
  const sourceDate = taskStorageDate(dateString, sectionKey);
  const list = tasksForDate(sourceDate, sectionKey);
  const index = list.findIndex((item) => item.id === taskIdValue);
  if (index === -1) return null;
  return { date: sourceDate, list, index, task: list[index] };
}

function destinationForDueDate(dueDate, fallbackSection) {
  if (!dueDate) return { date: taskStorageDate(state.currentDate, fallbackSection), section: fallbackSection };
  return { date: dueDate, section: "today" };
}

function addTask(sectionKey, text, options = {}) {
  const parsed = parseTaskInput(text, sectionKey, { disabled: options.disabled });
  if (!parsed.task.text.trim()) return;
  deferTaskSync();
  const destination = options.forceSection
    ? { date: taskStorageDate(state.currentDate, sectionKey), section: sectionKey }
    : destinationForDueDate(parsed.task.dueDate, parsed.section);
  if (options.forceSection && ["rightNow", "inbox"].includes(destination.section)) parsed.task.dueDate = "";
  const destinationTasks = tasksForDate(destination.date, destination.section);
  if (options.atFront) destinationTasks.unshift(parsed.task);
  else pushUniqueTask(destinationTasks, parsed.task);
  saveEverywhere({ extraDates: destination.date === state.currentDate ? [] : [destination.date] });
  renderTasksView();
  renderSidePanel();
}

function updateTask(sectionKey, taskIdValue, text, sourceDate = state.currentDate) {
  const ref = taskRef(sectionKey, taskIdValue, sourceDate);
  if (!ref) return;
  deferTaskSync();
  ref.task.text = text;
  ref.task.updatedAt = new Date().toISOString();
  saveLocal();
  debouncedSave({ extraDates: [ref.date] });
}

function updateTaskMeta(sectionKey, taskIdValue, patch, sourceDate = state.currentDate, saveOptions = {}) {
  const ref = taskRef(sectionKey, taskIdValue, sourceDate);
  if (!ref) return;
  deferTaskSync();
  Object.assign(ref.task, patch, { updatedAt: new Date().toISOString() });
  if (Object.prototype.hasOwnProperty.call(patch, "dueDate") && ref.task.dueDate && ref.task.dueDate !== ref.date) {
    ref.list.splice(ref.index, 1);
    pushUniqueTask(tasksForDate(ref.task.dueDate, "today"), ref.task);
    saveEverywhere({ ...saveOptions, extraDates: [ref.date, ref.task.dueDate] });
    renderTasksView();
    renderSidePanel();
    return;
  }
  const nextSection = ref.task.dueDate === state.currentDate ? "today" : sectionForTask(ref.task, sectionKey);
  if (nextSection !== sectionKey) {
    ref.list.splice(ref.index, 1);
    pushUniqueTask(tasksForDate(state.currentDate, nextSection), ref.task);
  }
  saveEverywhere({ ...saveOptions, extraDates: [ref.date] });
  renderTasksView();
  renderSidePanel();
}

function completeTask(sectionKey, taskIdValue, sourceDate = state.currentDate, completionDate = state.currentDate) {
  const ref = taskRef(sectionKey, taskIdValue, sourceDate);
  if (!ref) return;
  deferTaskSync();
  const [task] = ref.list.splice(ref.index, 1);
  const completedOn = validTaskDate(completionDate);
  ensureEntry(completedOn);
  state.entries[completedOn].tasks.completed.push({
    ...task,
    source: sectionKey,
    sourceDate: ref.date,
    previousIndex: ref.index,
    completedAt: new Date().toISOString(),
    completedVia: "app"
  });
  // A task materialised from a daily goal records the habit as it is completed,
  // so the monthly review counts real days rather than a memory of them.
  if (task.goalId) {
    logGoalEvent({ goalId: task.goalId, date: completedOn, kind: "check", value: true, source: "task" });
  }
  saveEverywhere({ extraDates: [ref.date, completedOn] });
  renderTasksView();
  renderSidePanel();
  renderCompletedOutput();
}

function rescheduleOverdueTaskForToday(sectionKey, taskIdValue, sourceDate) {
  const ref = taskRef(sectionKey, taskIdValue, sourceDate);
  if (!ref) return;
  deferTaskSync();
  const [task] = ref.list.splice(ref.index, 1);
  const actualToday = todayISO();
  task.dueDate = actualToday;
  task.updatedAt = new Date().toISOString();
  pushUniqueTask(tasksForDate(actualToday, "today"), task);
  saveEverywhere({ extraDates: [ref.date, actualToday] });
  renderTasksView();
  renderSidePanel();
}

function deleteTask(sectionKey, taskIdValue, sourceDate = state.currentDate) {
  const ref = taskRef(sectionKey, taskIdValue, sourceDate);
  if (!ref) return;
  deferTaskSync();
  const [task] = ref.list.splice(ref.index, 1);
  const discardedOn = validTaskDate(state.currentDate);
  ensureEntry(discardedOn);
  state.entries[discardedOn].tasks.discarded.push({
    ...task,
    source: sectionKey,
    sourceDate: ref.date,
    previousIndex: ref.index,
    discardedAt: new Date().toISOString()
  });
  saveEverywhere({ extraDates: [ref.date, discardedOn] });
  renderTasksView();
  renderSidePanel();
}

function collectTaskHistory() {
  const items = [];
  for (const [entryDate, entry] of Object.entries(state.entries || {})) {
    if (!entry?.tasks) continue;
    ensureTaskState(entry);
    for (const task of entry.tasks.completed) {
      items.push({ kind: "completed", task, entryDate, at: task.completedAt || `${entryDate}T00:00:00.000Z` });
    }
    for (const task of entry.tasks.discarded) {
      items.push({ kind: "discarded", task, entryDate, at: task.discardedAt || `${entryDate}T00:00:00.000Z` });
    }
  }
  items.sort((a, b) => (taskHistoryNewestFirst ? b.at.localeCompare(a.at) : a.at.localeCompare(b.at)));
  return items;
}

function historyBucket(kind, entryDate) {
  const entry = state.entries[entryDate];
  if (!entry?.tasks) return null;
  ensureTaskState(entry);
  return kind === "discarded" ? entry.tasks.discarded : entry.tasks.completed;
}

function restoreTaskFromHistory(kind, taskIdValue, entryDate) {
  const bucket = historyBucket(kind, entryDate);
  if (!bucket) return;
  const index = bucket.findIndex((item) => item.id === taskIdValue);
  if (index === -1) return;
  deferTaskSync();
  const [task] = bucket.splice(index, 1);
  const source = TASK_SECTION_KEYS.includes(task.source) ? task.source : "today";
  const expired = taskExpiryDate(task, entryDate);
  const staleExpiry = Boolean(expired && expired < todayISO());
  // Restoring an expired daily-goal task means doing it now, so it comes back
  // dated today. Restoring it onto the day it was for would only hand it
  // straight back to the next expiry sweep.
  const sourceDate = staleExpiry ? todayISO() : validTaskDate(task.sourceDate || state.currentDate);
  const restored = normalizeTask({
    ...task,
    source,
    sourceDate,
    expiresOn: staleExpiry ? todayISO() : task.expiresOn,
    updatedAt: new Date().toISOString(),
    completedAt: null,
    discardedAt: null
  }, source);
  const targetList = tasksForDate(sourceDate, source);
  const targetIndex = Math.min(Math.max(Number(task.previousIndex) || 0, 0), targetList.length);
  targetList.splice(targetIndex, 0, restored);
  saveEverywhere({ extraDates: [entryDate, sourceDate] });
  renderTasksView();
  renderSidePanel();
  renderCompletedOutput();
}

function purgeTaskFromHistory(kind, taskIdValue, entryDate) {
  const bucket = historyBucket(kind, entryDate);
  if (!bucket) return;
  const index = bucket.findIndex((item) => item.id === taskIdValue);
  if (index === -1) return;
  deferTaskSync();
  bucket.splice(index, 1);
  saveEverywhere({ extraDates: [entryDate] });
  renderTasksView();
  renderSidePanel();
  renderCompletedOutput();
}

function clearTaskHistory() {
  const dates = [];
  for (const [entryDate, entry] of Object.entries(state.entries || {})) {
    if (!entry?.tasks) continue;
    ensureTaskState(entry);
    if (!entry.tasks.completed.length && !entry.tasks.discarded.length) continue;
    entry.tasks.completed = [];
    entry.tasks.discarded = [];
    dates.push(entryDate);
  }
  if (!dates.length) return;
  deferTaskSync();
  saveEverywhere({ extraDates: dates });
  renderTasksView();
  renderSidePanel();
  renderCompletedOutput();
}

function undoLastCompletedTask() {
  const tasks = currentEntry().tasks;
  const completed = tasks.completed;
  if (!completed.length) return false;
  deferTaskSync();
  const task = completed.pop();
  const source = TASK_SECTION_KEYS.includes(task.source) ? task.source : "today";
  const sourceDate = validTaskDate(task.sourceDate || state.currentDate);
  const restored = {
    id: task.id || taskId(),
    text: task.text || "",
    project: task.project || "",
    labels: Array.isArray(task.labels) ? task.labels : [],
    priority: task.priority || "p4",
    dueDate: task.dueDate || "",
    createdAt: task.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const targetList = tasksForDate(sourceDate, source);
  const index = Math.min(Math.max(Number(task.previousIndex) || 0, 0), targetList.length);
  targetList.splice(index, 0, restored);
  saveEverywhere({ extraDates: [sourceDate] });
  renderTasksView();
  renderSidePanel();
  renderCompletedOutput();
  return true;
}

function handleGlobalUndo(event) {
  if (!(event.ctrlKey || event.metaKey)) return;
  const key = event.key.toLowerCase();
  const wantsUndo = key === "z" && !event.shiftKey;
  const wantsRedo = key === "y" || (key === "z" && event.shiftKey);
  if (!wantsUndo && !wantsRedo) return;
  const target = event.target;
  // closest(), not matches(): inside a contenteditable the keydown target is the
  // element holding the caret (a <p>, an <li>, a <td>), not the editable host, so
  // a plain matches() check let Ctrl+Z fall through to the app-wide undo and
  // rewound the whole day instead of the last few keystrokes.
  const isTextField = target?.matches?.("input, textarea") || target?.closest?.("[contenteditable='true']");
  if (isTextField) return;
  const changed = wantsRedo ? redoAppHistory() : undoAppHistory();
  if (!changed) return;
  event.preventDefault();
}

function moveTask(sectionKey, taskIdValue, beforeTaskId, sourceDate = state.currentDate, beforeSourceDate = sourceDate) {
  const ref = taskRef(sectionKey, taskIdValue, sourceDate);
  if (!ref || taskIdValue === beforeTaskId) return;
  deferTaskSync();
  const [task] = ref.list.splice(ref.index, 1);
  const to = beforeTaskId && ref.date === validTaskDate(beforeSourceDate) ? ref.list.findIndex((item) => item.id === beforeTaskId) : -1;
  if (to === -1) ref.list.push(task);
  else ref.list.splice(to, 0, task);
  saveEverywhere({ extraDates: [ref.date] });
  renderTasksView();
  renderSidePanel();
}

// Rewrites a section's stored order to match the rows currently on screen, which
// is how a live drag commits. Tasks the DOM does not show keep their tail order.
function commitTaskOrderFromRows(sectionKey, rows, sourceDate = state.currentDate) {
  const date = taskStorageDate(sourceDate, sectionKey);
  const list = tasksForDate(date, sectionKey);
  const order = rows.map((row) => row.dataset.taskId);
  const ordered = order.map((id) => list.find((task) => task.id === id)).filter(Boolean);
  if (ordered.length !== list.length) {
    for (const task of list) {
      if (!order.includes(task.id)) ordered.push(task);
    }
  }
  if (ordered.every((task, index) => task === list[index])) return;
  deferTaskSync();
  list.splice(0, list.length, ...ordered);
  saveEverywhere({ extraDates: [date] });
  renderTasksView();
  renderSidePanel();
}

// Moves the dragged row under the pointer while the drag is still happening. In
// Today and Do right now the drop targets are limited to the dragged task's own
// priority tier, so the preview never shows an order the tier sort would undo.
function previewTaskDrag(list, clientY) {
  const drag = taskDragState;
  if (!drag || drag.row.parentElement !== list) return;
  const peers = [...list.querySelectorAll(".task-row")].filter(
    (row) => row !== drag.row && (!drag.tierLocked || row.dataset.priority === drag.priority)
  );
  if (!peers.length) return;
  const before = peers.find((row) => {
    const box = row.getBoundingClientRect();
    return clientY < box.top + box.height / 2;
  });
  const anchor = before || peers[peers.length - 1].nextElementSibling;
  if (anchor === drag.row) return;
  if (!anchor && drag.row === list.lastElementChild) return;
  list.insertBefore(drag.row, anchor || null);
}

function moveTaskToSection(sectionKey, taskIdValue, nextSection, sourceDate = state.currentDate) {
  if (!TASK_SECTION_KEYS.includes(nextSection) || sectionKey === nextSection) return;
  const ref = taskRef(sectionKey, taskIdValue, sourceDate);
  if (!ref) return;
  deferTaskSync();
  const [task] = ref.list.splice(ref.index, 1);
  if (nextSection === "today") task.dueDate = state.currentDate || todayISO();
  if (nextSection === "upcoming" && (!task.dueDate || task.dueDate <= (state.currentDate || todayISO()))) {
    task.dueDate = shiftISODate(state.currentDate || todayISO(), 1);
  }
  if (nextSection === "inbox" || nextSection === "rightNow") task.dueDate = "";
  task.updatedAt = new Date().toISOString();
  const destinationDate = taskStorageDate(state.currentDate, nextSection);
  tasksForDate(destinationDate, nextSection).push(task);
  saveEverywhere({ extraDates: [ref.date, destinationDate] });
  renderTasksView();
  renderSidePanel();
}

async function openTaskHud() {
  saveEverywhere();
  try {
    const response = await fetch(`/api/open-hud?date=${encodeURIComponent(todayISO())}`, { method: "POST" });
    if (!response.ok) throw new Error("HUD launch failed");
    els.saveStatus.textContent = "HUD opened";
  } catch {
    els.saveStatus.textContent = "HUD launch failed";
  }
}

async function saveCustomChoices() {
  ensureCustomChoiceState();
  saveLocal();
  try {
    await fetch("/api/custom-choices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state.customChoices)
    });
  } catch {
    // Local storage is enough when the server is unavailable.
  }
}

function mergeCustomChoiceState(incoming) {
  ensureCustomChoiceState();
  for (const sessionName of ["morning", "night"]) {
    for (const [questionId, choices] of Object.entries(incoming?.[sessionName] || {})) {
      for (const choice of choices || []) addPersistentChoice(sessionName, questionId, choice, { select: false });
    }
    for (const [questionId, byChoice] of Object.entries(incoming?.choiceHistory?.[sessionName] || {})) {
      for (const [key, events] of Object.entries(byChoice || {})) {
        if (!state.customChoices.choiceHistory[sessionName][questionId]) state.customChoices.choiceHistory[sessionName][questionId] = {};
        state.customChoices.choiceHistory[sessionName][questionId][key] = mergeSurveyEvents(
          state.customChoices.choiceHistory[sessionName][questionId][key],
          events
        );
      }
    }
    for (const [questionId, events] of Object.entries(incoming?.questionHistory?.[sessionName] || {})) {
      state.customChoices.questionHistory[sessionName][questionId] = mergeSurveyEvents(
        state.customChoices.questionHistory[sessionName][questionId],
        events
      );
    }
    // Questions written by hand. The disk copy wins on a straight id collision:
    // this runs at startup against a state that is either empty or a stale
    // localStorage mirror, and disk is what the other devices wrote to.
    for (const raw of incoming?.customQuestions?.[sessionName] || []) {
      const question = normalizeCustomQuestion(raw);
      if (!question) continue;
      const list = state.customChoices.customQuestions[sessionName];
      const index = list.findIndex((item) => item.id === question.id);
      if (index > -1) list[index] = question;
      else list.push(question);
    }
    const order = incoming?.questionOrder?.[sessionName];
    if (Array.isArray(order) && order.length) {
      state.customChoices.questionOrder[sessionName] = order.map((id) => String(id));
    }
  }
}

function mergeSurveyEvents(local, incoming) {
  const byDate = new Map();
  for (const event of [...(local || []), ...(incoming || [])]) {
    if (!event?.date || !event?.action) continue;
    byDate.set(event.date, { date: event.date, action: event.action });
  }
  return [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

function render() {
  const entry = currentEntry();
  document.body.dataset.session = state.theme || "morning";
  applyColors();
  renderColorControls();
  els.dateInput.value = state.currentDate;
  els.todayLine.textContent = formatDateLine(state.currentDate);
  renderTodayButtonState();
  els.sunButton.classList.toggle("active", (state.theme || "morning") === "morning");
  els.moonButton.classList.toggle("active", state.theme === "night");
  els.documentViewButton.classList.toggle("active", activeView === "document");
  els.tasksViewButton.classList.toggle("active", activeView === "tasks");
  els.calendarViewButton.classList.toggle("active", activeView === "calendar");
  els.listsNavToggle.classList.toggle("active", LIST_NAV_VIEWS.includes(activeView) && !listsNavOpen);
  els.mistakesViewButton.classList.toggle("active", activeView === "mistakes");
  els.learnViewButton.classList.toggle("active", activeView === "learn");
  els.shoppingViewButton.classList.toggle("active", activeView === "shopping");
  els.peopleViewButton.classList.toggle("active", activeView === "people");
  els.settingsViewButton.classList.toggle("active", activeView === "settings");
  els.settingsViewButton.setAttribute("aria-pressed", String(activeView === "settings"));
  els.trendsViewButton.classList.toggle("active", activeView === "trends");
  els.trendsViewButton.setAttribute("aria-pressed", String(activeView === "trends"));
  els.morningSurveyViewButton.classList.toggle("active", activeView === "survey" && state.session === "morning");
  els.nightSurveyViewButton.classList.toggle("active", activeView === "survey" && state.session === "night");
  els.guideTitle.textContent = ["tasks", "calendar"].includes(activeView) ? "Task Queue" : activeView === "settings" ? "Settings" : "";
  els.guideTitle.parentElement.classList.toggle("is-empty", !els.guideTitle.textContent);
  els.editorTitle.textContent = viewTitle();
  renderDocumentEditor(entry);
  renderOutputPanelState();
  renderSidePanel();
  renderSearchResults();
  renderWorkArea();
  renderMiniRow();
  renderOutputs();
  renderTabs();
}

function renderTodayButtonState() {
  const isToday = state.currentDate === todayISO();
  els.todayButton.classList.toggle("is-today", isToday);
  els.todayButton.classList.toggle("is-away", !isToday);
  els.todayButton.setAttribute("aria-pressed", String(isToday));
  els.todayButton.title = isToday ? "You are viewing today" : "Jump back to today";
}

function renderOutputPanelState() {
  ensurePaneSizes();
  els.outputPanel.classList.toggle("is-collapsed", state.paneSizes.outputCollapsed);
  els.toggleOutputPanelButton.textContent = state.paneSizes.outputCollapsed ? "\u2039" : "\u203a";
  els.toggleOutputPanelButton.title = state.paneSizes.outputCollapsed ? "Expand output panel" : "Collapse output panel";
  els.toggleOutputPanelButton.setAttribute("aria-label", els.toggleOutputPanelButton.title);
}

function viewTitle() {
  if (activeView === "tasks") return "Tasks";
  if (activeView === "calendar") return "Calendar";
  if (activeView === "mistakes") return "Lessons from Experience";
  if (activeView === "learn") return "Learn About";
  if (activeView === "shopping") return "Shopping List";
  if (activeView === "people") return "Rolodex";
  if (activeView === "settings") return "Settings";
  if (activeView === "trends") return "Trends";
  if (activeView === "survey") return state.session === "morning" ? "Morning Survey" : "Night Survey";
  return "Daily Document";
}

function visibleSurveyQuestions(session, dateString = state.currentDate) {
  return allSurveyQuestions(session)
    .filter((item) => item.includeInUi !== false)
    .filter((item) => isSurveyQuestionVisibleOn(session, item, dateString));
}

// Hidden questions that could sensibly be brought back on this date. A custom
// question written next week is hidden today too, but it was never *removed*
// from today, so offering to restore it here would be nonsense.
function removedSurveyQuestions(session, dateString = state.currentDate) {
  return allSurveyQuestions(session)
    .filter((item) => item.includeInUi !== false)
    .filter((item) => !isSurveyQuestionVisibleOn(session, item, dateString))
    .filter((item) => !item.custom || (item.createdOn && item.createdOn <= dateString));
}

function renderSidePanel() {
  els.checklist.innerHTML = "";
  if (["calendar", "tasks"].includes(activeView)) {
    renderTaskQueueSidebar();
  }
}

function renderTaskQueueSidebar() {
  const entry = currentEntry();
  ensureTaskState(entry);

  const guide = document.createElement("p");
  guide.className = "task-queue-guide";
  guide.textContent = "Overdue · Inbox → Today → Do right now";
  els.checklist.append(guide);

  // Unbooked deadlines ride the rail too: it is the panel already on screen
  // while the calendar is open, which is exactly where the booking happens.
  const unplannedDeadlines = upcomingDeadlineItems().filter((item) => !item.planned);
  if (unplannedDeadlines.length) {
    const group = document.createElement("section");
    group.className = "sidebar-task-group is-deadlines";
    const head = document.createElement("div");
    head.className = "sidebar-task-head";
    const heading = document.createElement("strong");
    heading.textContent = "Deadlines to plan";
    const count = document.createElement("span");
    count.textContent = String(unplannedDeadlines.length);
    head.append(heading, count);
    const description = document.createElement("p");
    description.textContent = "Due dates with no work time booked";
    group.append(head, description);
    for (const item of unplannedDeadlines) group.append(deadlineNagRow(item));
    els.checklist.append(group);
  }

  const descriptions = {
    overdue: "Past its date as of today",
    rightNow: "Focus stack · the HUD uses the first task",
    today: "Committed for this date",
    inbox: "Unsorted · carries forward"
  };
  const overdue = overdueTaskItems();
  const sidebarSections = [
    ...(overdue.length ? [{ ...OVERDUE_SECTION, virtualTasks: overdue }] : []),
    ...["rightNow", "today", "inbox"].map((sectionKey) => TASK_SECTIONS.find((item) => item.key === sectionKey))
  ];
  for (const section of sidebarSections) {
    const sectionKey = section.key;
    const items = taskItemsForSection(entry, section, section.virtualTasks || null);
    const group = document.createElement("section");
    group.className = `sidebar-task-group is-${sectionKey}`;

    const head = document.createElement("div");
    head.className = "sidebar-task-head";
    const heading = document.createElement("strong");
    heading.textContent = section.title;
    const count = document.createElement("span");
    count.textContent = String(items.length);
    head.append(heading, count);
    const description = document.createElement("p");
    description.textContent = descriptions[sectionKey];
    group.append(head, description);

    const list = document.createElement("div");
    list.className = "sidebar-task-list";
    if (!items.length) {
      const empty = document.createElement("span");
      empty.className = "sidebar-task-empty";
      empty.textContent = section.empty;
      list.append(empty);
    }
    for (const item of items) list.append(sidebarTaskRow(item));
    group.append(list);
    els.checklist.append(group);
  }

  const open = document.createElement("button");
  open.type = "button";
  open.className = "quiet sidebar-open-tasks";
  open.textContent = "Open full task view";
  open.addEventListener("click", () => setView("tasks"));
  els.checklist.append(open);
}

function sidebarTaskRow(item) {
  const row = document.createElement("div");
  row.className = "sidebar-task-row";
  const done = document.createElement("button");
  done.type = "button";
  done.className = "sidebar-task-done";
  done.setAttribute("aria-label", `Complete ${item.task.text}`);
  done.title = "Complete task";
  done.addEventListener("click", () => completeTask(item.sectionKey, item.task.id, item.sourceDate, item.overdueDate ? todayISO() : state.currentDate));

  const text = document.createElement("button");
  text.type = "button";
  text.className = "sidebar-task-text";
  text.textContent = taskDisplayLine(item.task, item.overdueDate, item.sourceDate);
  text.title = "Open in Tasks";
  text.addEventListener("click", () => {
    taskFilter = item.displaySectionKey || item.sectionKey;
    setView("tasks");
  });

  // The rail sits beside the calendar, so this is where scheduling the day
  // actually happens: press here, then click the hour.
  const place = document.createElement("button");
  place.type = "button";
  place.className = "sidebar-task-place";
  place.textContent = "◷";
  applyPlaceButtonState(place, item.task);
  place.addEventListener("click", () => startTaskPlacement(item.sectionKey, item.task, item.sourceDate));

  // The rail is ~190px wide. A third button in its own column left the text
  // about 57px and wrapped every row to four lines, so the buttons sit on their
  // own line under the text instead.
  const actions = document.createElement("div");
  actions.className = "sidebar-task-actions";
  actions.append(place);
  row.append(done, text, actions);
  if (item.sectionKey !== "rightNow" || item.overdueDate) {
    const promote = document.createElement("button");
    promote.type = "button";
    promote.className = "sidebar-task-promote";
    const nextSection = item.overdueDate || item.sectionKey === "inbox" ? "today" : "rightNow";
    promote.textContent = "→";
    promote.title = item.overdueDate ? "Reschedule for today" : nextSection === "today" ? "Commit to today" : "Move to Do right now";
    promote.setAttribute("aria-label", promote.title);
    promote.addEventListener("click", () => {
      if (item.overdueDate) rescheduleOverdueTaskForToday(item.sectionKey, item.task.id, item.sourceDate);
      else moveTaskToSection(item.sectionKey, item.task.id, nextSection, item.sourceDate);
    });
    actions.append(promote);
  }
  return row;
}

function renderSearchResults() {
  if (!els.searchInput || !els.searchResults) return;
  const query = normalize(els.searchInput.value || "").trim();
  els.searchResults.innerHTML = "";
  if (!query) return;
  const terms = query.split(/\s+/).filter(Boolean);
  const results = Object.values(state.entries || {})
    .map((entry) => ({ entry, haystack: searchableEntryText(entry) }))
    .filter(({ haystack }) => terms.every((term) => haystack.includes(term)))
    .sort((a, b) => b.entry.date.localeCompare(a.entry.date))
    .slice(0, 12);
  const events = searchCalendarEvents(terms);
  if (!results.length && !events.length) {
    const empty = document.createElement("div");
    empty.className = "search-empty";
    empty.textContent = "No matching days or events.";
    els.searchResults.append(empty);
    return;
  }
  if (results.length) {
    els.searchResults.append(searchGroupHeading("Days"));
  }
  for (const { entry } of results) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "search-result";
    const title = document.createElement("strong");
    title.textContent = formatShortDate(entry.date);
    const snippet = document.createElement("span");
    snippet.textContent = searchSnippet(entry, query);
    button.append(title, snippet);
    button.addEventListener("click", () => {
      syncDocumentText();
      state.currentDate = entry.date;
      ensureEntry(state.currentDate);
      saveLocal();
      render();
    });
    els.searchResults.append(button);
  }
  if (events.length) {
    els.searchResults.append(searchGroupHeading("Calendar"));
  }
  for (const event of events) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "search-result";
    const title = document.createElement("strong");
    title.textContent = calendarEventFullTitle(event);
    const snippet = document.createElement("span");
    snippet.textContent = [
      `${formatShortDate(event.start.slice(0, 10))} ${event.start.slice(11, 16)}`,
      event.kind,
      categoryLabel(event.category),
      event.location,
      event.notes
    ].filter(Boolean).join(" · ").slice(0, 120);
    button.append(title, snippet);
    button.addEventListener("click", () => {
      syncDocumentText();
      const date = event.start.slice(0, 10);
      state.currentDate = date;
      ensureEntry(date);
      calendarCursorDate = date;
      calendarMode = "day";
      saveLocal();
      setView("calendar");
    });
    els.searchResults.append(button);
  }
}

function searchGroupHeading(text) {
  const heading = document.createElement("div");
  heading.className = "search-group";
  heading.textContent = text;
  return heading;
}

// Searches the stored events rather than the day-by-day expansion: a weekly
// repeat should answer once, as the series, instead of filling the list with
// one row per occurrence and pushing everything else out of it. Newest first,
// because "when did I last..." is what this gets asked.
function searchCalendarEvents(terms) {
  return (state.calendarEvents || [])
    .filter((event) => {
      if (!event?.start) return false;
      const haystack = normalize([
        calendarEventFullTitle(event),
        event.notes,
        event.location,
        categoryLabel(event.category)
      ].filter(Boolean).join(" "));
      return terms.every((term) => haystack.includes(term));
    })
    .sort((a, b) => String(b.start).localeCompare(String(a.start)))
    .slice(0, 8);
}

function searchableEntryText(entry) {
  return normalize([
    entry.date,
    entry.journal,
    entry.morning?.text,
    entry.night?.text,
    surveySearchText("morning", entry.morning?.survey, entry.date),
    surveySearchText("night", entry.night?.survey, entry.date),
    ...(entry.hours?.plan || []),
    ...(entry.hours?.reality || []),
    ...(entry.hours?.categories || []),
    ...TASK_SECTION_KEYS.flatMap((key) => entry.tasks?.[key] || []).map(taskSearchText)
  ].filter(Boolean).join(" "));
}

function surveySearchText(sessionName, survey, dateString) {
  return SCHEMA.surveys[sessionName]
    .map((question) => surveyValue(question, survey || {}, dateString))
    .join(" ");
}

function taskSearchText(task) {
  return [task.text, task.project, ...(task.labels || []), task.priority, task.dueDate].filter(Boolean).join(" ");
}

function searchSnippet(entry, query) {
  const source = [entry.journal, ...(entry.hours?.reality || []), ...(entry.hours?.plan || [])].filter(Boolean).join(" ");
  if (!source) return "No text preview.";
  const normalizedSource = normalize(source);
  const index = normalizedSource.indexOf(query.split(/\s+/)[0]);
  const start = Math.max(0, index > -1 ? index - 36 : 0);
  const snippet = source.slice(start, start + 96).trim();
  return snippet || "Match found.";
}

function formatShortDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function renderWorkArea() {
  // The survey borrows the real calendar view as a right-hand column: same
  // element, same drag/edit/kind controls, just shown beside the form instead
  // of instead of it.
  const surveySplit = activeView === "survey" && surveyCalendarOpen;
  if (activeView === "survey") {
    if (surveyCalendarPinnedDate !== state.currentDate) {
      surveyCalendarPinnedDate = state.currentDate;
      calendarCursorDate = state.currentDate;
      calendarMode = "day";
    }
  } else {
    surveyCalendarPinnedDate = null;
  }
  els.workArea.classList.toggle("survey-split", surveySplit);
  els.documentEditor.classList.toggle("hidden", activeView !== "document");
  els.tasksView.classList.toggle("hidden", activeView !== "tasks");
  els.calendarView.classList.toggle("hidden", activeView !== "calendar" && !surveySplit);
  els.mistakesView.classList.toggle("hidden", activeView !== "mistakes");
  els.learnView.classList.toggle("hidden", activeView !== "learn");
  els.shoppingView.classList.toggle("hidden", activeView !== "shopping");
  els.peopleView.classList.toggle("hidden", activeView !== "people");
  els.settingsView.classList.toggle("hidden", activeView !== "settings");
  els.trendsView.classList.toggle("hidden", activeView !== "trends");
  els.reviewView.classList.toggle("hidden", activeView !== "review");
  els.formView.classList.toggle("hidden", activeView !== "survey");
  els.processButton.classList.toggle("hidden", activeView !== "document");
  if (activeView === "tasks") renderTasksView();
  if (activeView === "calendar") renderCalendarView();
  if (activeView === "mistakes") renderMistakesView();
  if (activeView === "learn") renderLearnView();
  if (activeView === "shopping") renderShoppingView();
  if (activeView === "people") renderPeopleView();
  if (activeView === "settings") renderSettingsView();
  if (activeView === "trends") renderTrendsView();
  if (activeView === "review") renderMonthlyReviewView();
  if (activeView === "survey") {
    renderSurveyForm();
    if (surveySplit) renderCalendarView();
  }
}

function firstOpenTask() {
  // Same order the section renders in: highest priority tier first, stored
  // order inside a tier — so "Current task" matches the top of the list.
  const tasks = tasksForDate(todayISO(), "rightNow");
  let best = null;
  for (const task of tasks) {
    if (!best || taskPriorityRank(task) < taskPriorityRank(best)) best = task;
  }
  return best;
}

/* --- Quick-add field and its parse preview ----------------------------------

   One builder for both add fields, so the sync guard and the preview cannot
   drift apart between them. The chips underneath are the Todoist trick: what
   the parser took out of the line, shown as raw text → what it became, each one
   clickable to put it back into the title as plain words.
--------------------------------------------------------------------------- */

function createTaskAddForm({ className, placeholder, onSubmit }) {
  const wrap = document.createElement("div");
  wrap.className = "task-add";
  const form = document.createElement("form");
  form.className = className;
  const input = document.createElement("input");
  input.type = "text";
  input.dataset.taskEditor = "add";
  input.placeholder = placeholder;
  const button = document.createElement("button");
  button.type = "submit";
  button.textContent = "Add";
  form.append(input, button);
  const preview = document.createElement("div");
  preview.className = "task-parse-preview";
  // Keyed by kind and position, so switching a token off survives further
  // typing elsewhere in the line but is dropped once the row is created.
  const disabled = new Set();
  const refresh = () => renderTaskParsePreview(preview, input.value, disabled, refresh);

  input.addEventListener("focus", deferTaskSync);
  input.addEventListener("input", () => {
    deferTaskSync();
    refresh();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    onSubmit(input.value, disabled);
    input.value = "";
    disabled.clear();
    refresh();
    input.focus();
  });
  wrap.append(form, preview);
  return wrap;
}

function renderTaskParsePreview(container, text, disabled, onChange) {
  container.innerHTML = "";
  if (!String(text || "").trim()) return;
  const parsed = parseTaskInput(text, "inbox", { disabled });
  if (!parsed.tokens.length) return;
  for (const token of parsed.tokens) {
    const chip = document.createElement("button");
    chip.type = "button";
    // Out of the tab order: this is a mouse affordance beside a field that is
    // meant to be typed straight through and submitted with Enter.
    chip.tabIndex = -1;
    chip.className = token.off ? "task-parse-chip is-off" : "task-parse-chip";
    const raw = document.createElement("span");
    raw.className = "task-parse-raw";
    raw.textContent = token.text;
    const arrow = document.createElement("span");
    arrow.className = "task-parse-arrow";
    arrow.textContent = "→";
    const label = document.createElement("span");
    label.textContent = token.label;
    chip.append(raw, arrow, label);
    chip.title = token.off ? "Read this as a shortcut again" : "Keep this as plain words in the title";
    // mousedown with preventDefault, not click: the field must keep focus, or
    // isTaskTextEditing() stops seeing an edit in progress and the next sync
    // poll is free to re-render the view out from under the half-typed row.
    chip.addEventListener("mousedown", (event) => {
      event.preventDefault();
      deferTaskSync();
      if (disabled.has(token.key)) disabled.delete(token.key);
      else disabled.add(token.key);
      onChange();
    });
    container.append(chip);
  }
  const result = document.createElement("span");
  result.className = "task-parse-result";
  const title = parsed.task.text.trim();
  result.textContent = title ? `→ ${title}` : "→ nothing left for the title";
  result.classList.toggle("is-empty", !title);
  container.append(result);
}

function renderMistakesView() {
  const entry = currentEntry();
  ensureMistakeState(entry);
  els.mistakesView.innerHTML = "";

  const toolbar = document.createElement("div");
  toolbar.className = "mistakes-toolbar";
  const summary = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = mistakesReviewOpen ? "All days" : "Today's log";
  const status = document.createElement("p");
  status.textContent = mistakesReviewOpen ? mistakeReviewSummary() : mistakeDaySummary(entry);
  summary.append(title, status);
  const actions = document.createElement("div");
  actions.className = "mistakes-toolbar-actions";
  const reviewButton = document.createElement("button");
  reviewButton.type = "button";
  reviewButton.className = mistakesReviewOpen ? "quiet active" : "quiet";
  reviewButton.textContent = mistakesReviewOpen ? "Back to today" : "All days";
  reviewButton.addEventListener("click", () => {
    mistakesReviewOpen = !mistakesReviewOpen;
    renderMistakesView();
  });
  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.className = "quiet";
  copyButton.textContent = "Copy TSV";
  copyButton.addEventListener("click", () => copyText(buildMistakesTSV(mistakesReviewOpen)));
  actions.append(reviewButton, copyButton);
  toolbar.append(summary, actions);
  els.mistakesView.append(toolbar);

  if (mistakesReviewOpen) {
    els.mistakesView.append(renderMistakeReviewPanel());
    return;
  }

  const quickAdd = document.createElement("form");
  quickAdd.className = "mistake-quick-add";
  const quickInput = document.createElement("input");
  quickInput.type = "text";
  quickInput.placeholder = "What I did — Enter logs it now, good or bad can be decided later";
  quickAdd.append(quickInput, ...mistakeOutcomeButtons(() => {
    const text = quickInput.value;
    quickInput.value = "";
    return text;
  }, () => els.mistakesView.querySelector(".mistake-quick-add input")?.focus()));
  quickAdd.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = quickInput.value;
    quickInput.value = "";
    addMistake(text);
    els.mistakesView.querySelector(".mistake-quick-add input")?.focus();
  });
  els.mistakesView.append(quickAdd);

  if (!entry.mistakes.length) {
    const empty = document.createElement("p");
    empty.className = "mistakes-empty";
    empty.textContent = "Nothing logged today.";
    els.mistakesView.append(empty);
    return;
  }

  const list = document.createElement("div");
  list.className = "mistake-list";
  for (const mistake of entry.mistakes) list.append(renderMistakeCard(mistake));
  els.mistakesView.append(list);
}

function renderMistakeCard(mistake) {
  const card = document.createElement("article");
  card.className = mistakeIsComplete(mistake) ? "mistake-card" : "mistake-card is-unfinished";

  card.dataset.outcome = mistake.outcome || "";

  const head = document.createElement("div");
  head.className = "mistake-card-head";
  const time = document.createElement("span");
  time.textContent = mistake.time || "";
  const outcomeToggle = renderMistakeOutcomeToggle(mistake, (outcome) => {
    card.dataset.outcome = outcome;
    card.classList.toggle("is-unfinished", !mistakeIsComplete(mistake));
  });
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "icon-button quiet";
  remove.textContent = "×";
  remove.title = "Delete this row";
  remove.setAttribute("aria-label", "Delete this row");
  remove.addEventListener("click", () => removeMistake(mistake.id));
  head.append(time, outcomeToggle, remove);

  const grid = document.createElement("div");
  grid.className = "mistake-grid";
  for (const column of MISTAKE_COLUMNS) {
    const field = document.createElement("label");
    field.className = "mistake-field";
    const label = document.createElement("span");
    label.textContent = column.label;
    const input = document.createElement("textarea");
    input.rows = 2;
    input.value = mistake[column.key] || "";
    input.placeholder = column.placeholder;
    input.addEventListener("input", () => {
      updateMistakeField(mistake.id, column.key, input.value);
      autoGrowField(input);
      card.classList.toggle("is-unfinished", !mistakeIsComplete(mistake));
    });
    field.append(label, input);
    grid.append(field);
    requestAnimationFrame(() => autoGrowField(input));
  }

  card.append(head, grid, renderMistakeTagRow(mistake));
  return card;
}

// The good/bad choice on a card. Clicking the chosen side again clears it back
// to "not yet judged" rather than forcing one of the two: a row that turns out
// to be neither is a legitimate answer.
function renderMistakeOutcomeToggle(mistake, onChange) {
  const wrap = document.createElement("div");
  wrap.className = "mistake-outcome";
  wrap.setAttribute("role", "group");
  wrap.setAttribute("aria-label", "How it turned out");
  for (const option of MISTAKE_OUTCOMES) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.outcome = option.key;
    button.className = mistake.outcome === option.key ? "mistake-outcome-option is-on" : "mistake-outcome-option";
    button.textContent = option.label;
    button.setAttribute("aria-pressed", String(mistake.outcome === option.key));
    button.addEventListener("click", () => {
      const next = mistake.outcome === option.key ? "" : option.key;
      updateMistakeField(mistake.id, "outcome", next);
      for (const sibling of wrap.querySelectorAll(".mistake-outcome-option")) {
        const on = sibling.dataset.outcome === next;
        sibling.classList.toggle("is-on", on);
        sibling.setAttribute("aria-pressed", String(on));
      }
      onChange?.(next);
    });
    wrap.append(button);
  }
  return wrap;
}

// "Went well" / "Went badly" buttons for the quick-add forms. Both log the row
// with its outcome already set; the form's own Enter path logs it with no
// outcome, so capture is never gated behind the judgement.
function mistakeOutcomeButtons(takeText, afterAdd) {
  return MISTAKE_OUTCOMES.map((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `mistake-outcome-log is-${option.key}`;
    button.textContent = option.label;
    button.title = `Log it as something that ${option.label.toLowerCase()}`;
    button.addEventListener("click", () => {
      addMistake(takeText(), option.key);
      afterAdd?.();
    });
    return button;
  });
}

function renderMistakeTagRow(mistake) {
  const wrap = document.createElement("div");
  wrap.className = "mistake-tags";
  const label = document.createElement("span");
  label.className = "mistake-tags-label";
  label.textContent = "Pattern";
  wrap.append(label);

  const chips = document.createElement("div");
  chips.className = "mistake-tag-chips";
  const chosen = new Set((mistake.tags || []).map((tag) => normalize(tag)));
  // Selected tags always render, even if the vocabulary somehow lost them, so a
  // tag can never become invisible-but-stored.
  const vocabulary = mistakeTagVocabulary();
  for (const tag of vocabulary) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = chosen.has(normalize(tag)) ? "mistake-tag is-on" : "mistake-tag";
    chip.textContent = tag;
    chip.setAttribute("aria-pressed", String(chosen.has(normalize(tag))));
    chip.addEventListener("click", () => toggleMistakeTag(mistake.id, tag));
    chips.append(chip);
  }
  const add = document.createElement("form");
  add.className = "mistake-tag-add";
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "+ pattern";
  input.setAttribute("aria-label", "Add a pattern tag");
  add.append(input);
  add.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value.trim();
    input.value = "";
    if (value) toggleMistakeTag(mistake.id, value);
  });
  chips.append(add);
  wrap.append(chips);

  const recurrence = mistakeTagRecurrence(mistake);
  if (recurrence) {
    const note = document.createElement("p");
    note.className = "mistake-tag-recurrence";
    note.textContent = recurrence;
    wrap.append(note);
  }
  return wrap;
}

function autoGrowField(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = `${Math.max(textarea.scrollHeight, 44)}px`;
}

function mistakeDaySummary(entry) {
  const total = (entry.mistakes || []).length;
  if (!total) return "Log a decision the moment you notice it, good or bad; the other columns can wait.";
  const unfinished = unfinishedMistakeCount(entry);
  const rows = `${total} ${total === 1 ? "row" : "rows"}`;
  return unfinished ? `${rows} · ${unfinished} still to finish` : `${rows} · all filled in`;
}

function mistakeReviewSummary() {
  const days = allMistakeDays();
  const total = days.reduce((sum, day) => sum + day.mistakes.length, 0);
  if (!total) return "Nothing logged yet.";
  const good = days.reduce((sum, day) => sum + day.mistakes.filter((mistake) => mistake.outcome === "good").length, 0);
  const bad = days.reduce((sum, day) => sum + day.mistakes.filter((mistake) => mistake.outcome === "bad").length, 0);
  return `${total} ${total === 1 ? "row" : "rows"} across ${days.length} ${days.length === 1 ? "day" : "days"} · ${good} went well · ${bad} went badly`;
}

function renderMistakeReviewPanel() {
  const panel = document.createElement("section");
  panel.className = "mistake-review";

  const search = document.createElement("input");
  search.type = "search";
  search.className = "mistake-review-search";
  search.placeholder = "Search every column";
  search.value = mistakesReviewQuery;
  search.addEventListener("input", () => {
    mistakesReviewQuery = search.value;
    renderMistakeReviewResults(results);
  });
  panel.append(search);

  // The point of tagging is the count. Putting it above the rows means opening
  // "All days" answers "what do I keep doing" before any scrolling.
  const counts = [...mistakeTagCounts().entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  if (counts.length) {
    const summary = document.createElement("div");
    summary.className = "mistake-tag-summary";
    const heading = document.createElement("span");
    heading.className = "mistake-tags-label";
    heading.textContent = "Patterns";
    summary.append(heading);
    for (const [tag, count] of counts) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = normalize(mistakesReviewQuery.trim()) === normalize(tag) ? "mistake-tag is-on" : "mistake-tag";
      chip.textContent = `${tag} ${count}`;
      chip.title = `Show the ${count} row${count === 1 ? "" : "s"} tagged ${tag}`;
      chip.addEventListener("click", () => {
        mistakesReviewQuery = normalize(mistakesReviewQuery.trim()) === normalize(tag) ? "" : tag;
        renderMistakesView();
      });
      summary.append(chip);
    }
    panel.append(summary);
  }

  const results = document.createElement("div");
  results.className = "mistake-review-results";
  panel.append(results);
  renderMistakeReviewResults(results);
  return panel;
}

function renderMistakeReviewResults(container) {
  container.innerHTML = "";
  const query = normalize(mistakesReviewQuery.trim());
  const days = allMistakeDays()
    .map((day) => ({
      date: day.date,
      mistakes: query ? day.mistakes.filter((mistake) => mistakeMatchesQuery(mistake, query)) : day.mistakes
    }))
    .filter((day) => day.mistakes.length);

  if (!days.length) {
    const empty = document.createElement("p");
    empty.className = "mistakes-empty";
    empty.textContent = query ? "Nothing matches that." : "Nothing logged yet.";
    container.append(empty);
    return;
  }

  for (const day of days) {
    const group = document.createElement("div");
    group.className = "mistake-review-day";
    const head = document.createElement("button");
    head.type = "button";
    head.className = "mistake-review-date";
    head.textContent = `${formatDateLine(day.date)} · ${day.mistakes.length}`;
    head.title = "Open this day";
    head.addEventListener("click", () => {
      syncDocumentText();
      state.currentDate = day.date;
      ensureEntry(day.date);
      mistakesReviewOpen = false;
      saveLocal();
      render();
    });
    group.append(head);
    for (const mistake of day.mistakes) {
      const row = document.createElement("div");
      row.className = "mistake-review-row";
      row.dataset.outcome = mistake.outcome || "";
      {
        const cell = document.createElement("div");
        cell.className = "mistake-review-cell mistake-review-outcome";
        const label = document.createElement("span");
        label.textContent = "Outcome";
        const value = document.createElement("p");
        value.textContent = mistakeOutcomeLabel(mistake.outcome, "label") || "Not judged yet";
        cell.append(label, value);
        row.append(cell);
      }
      for (const column of MISTAKE_COLUMNS) {
        const cell = document.createElement("div");
        cell.className = "mistake-review-cell";
        const label = document.createElement("span");
        label.textContent = column.label;
        const value = document.createElement("p");
        value.textContent = mistake[column.key] || "—";
        cell.append(label, value);
        row.append(cell);
      }
      if ((mistake.tags || []).length) {
        const cell = document.createElement("div");
        cell.className = "mistake-review-cell";
        const label = document.createElement("span");
        label.textContent = "Pattern";
        const value = document.createElement("p");
        value.textContent = mistake.tags.join(", ");
        cell.append(label, value);
        row.append(cell);
      }
      group.append(row);
    }
    container.append(group);
  }
}

function mistakeMatchesQuery(mistake, query) {
  if (MISTAKE_COLUMNS.some((column) => normalize(mistake[column.key] || "").includes(query))) return true;
  if (normalize(mistakeOutcomeLabel(mistake.outcome, "label")).includes(query)) return true;
  return (mistake.tags || []).some((tag) => normalize(tag).includes(query));
}

function buildMistakesTSV(allDays) {
  // Tags trail the prose columns rather than joining MISTAKE_COLUMNS, so the
  // sheet keeps the five-column shape it has always had and the pattern arrives
  // as an extra field on the end.
  const header = ["Date", "Time", "Outcome", ...MISTAKE_COLUMNS.map((column) => column.label), "Pattern"];
  const days = allDays ? allMistakeDays().slice().reverse() : [{ date: state.currentDate, mistakes: currentEntry().mistakes || [] }];
  const rows = days.flatMap((day) =>
    day.mistakes.map((mistake) => [
      day.date,
      mistake.time,
      mistakeOutcomeLabel(mistake.outcome, "label"),
      ...MISTAKE_COLUMNS.map((column) => mistake[column.key] || ""),
      (mistake.tags || []).join(", ")
    ])
  );
  return [header, ...rows].map((row) => row.map(tsvCell).join("\t")).join("\n");
}

function renderTaskHistoryPanel() {
  const panel = document.createElement("section");
  panel.className = "task-section task-history-panel";

  const head = document.createElement("div");
  head.className = "task-section-head";
  const heading = document.createElement("h3");
  const items = collectTaskHistory();
  heading.textContent = `History (${items.length})`;
  const headActions = document.createElement("div");
  headActions.className = "task-history-head-actions";
  const orderButton = document.createElement("button");
  orderButton.type = "button";
  orderButton.className = "quiet";
  orderButton.textContent = taskHistoryNewestFirst ? "Newest first" : "Oldest first";
  orderButton.addEventListener("click", () => {
    taskHistoryNewestFirst = !taskHistoryNewestFirst;
    renderTasksView();
  });
  headActions.append(orderButton);
  if (items.length) {
    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.className = "quiet";
    clearButton.textContent = "Clear history";
    clearButton.addEventListener("click", () => {
      if (window.confirm(`Permanently delete all ${items.length} history entries? This cannot be undone.`)) clearTaskHistory();
    });
    headActions.append(clearButton);
  }
  head.append(heading, headActions);
  panel.append(head);

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No completed or discarded tasks yet.";
    panel.append(empty);
    return panel;
  }

  const list = document.createElement("div");
  list.className = "task-history-list";
  for (const item of items) {
    const row = document.createElement("div");
    row.className = `task-history-row is-${item.kind}`;

    const main = document.createElement("div");
    main.className = "task-history-main";
    const text = document.createElement("strong");
    text.textContent = item.task.text || "(untitled task)";
    const meta = document.createElement("span");
    const stamp = new Date(item.at);
    const when = Number.isNaN(stamp.getTime())
      ? formatShortDate(item.entryDate)
      : `${formatShortDate(item.entryDate)} ${formatClockTime(stamp)}`;
    const bits = [item.kind === "discarded" ? "Discarded" : "Completed", when];
    if (item.task.project) bits.push(`#${item.task.project}`);
    if (item.task.priority && item.task.priority !== "p4") bits.push(item.task.priority.toUpperCase());
    meta.textContent = bits.join(" · ");
    main.append(text, meta);

    const actions = document.createElement("div");
    actions.className = "task-history-actions";
    const restoreButton = document.createElement("button");
    restoreButton.type = "button";
    restoreButton.className = "quiet";
    restoreButton.textContent = "Restore";
    restoreButton.addEventListener("click", () => restoreTaskFromHistory(item.kind, item.task.id, item.entryDate));
    const purgeButton = document.createElement("button");
    purgeButton.type = "button";
    purgeButton.className = "quiet";
    purgeButton.textContent = "Delete";
    purgeButton.addEventListener("click", () => purgeTaskFromHistory(item.kind, item.task.id, item.entryDate));
    actions.append(restoreButton, purgeButton);

    row.append(main, actions);
    list.append(row);
  }
  panel.append(list);
  return panel;
}

function renderTasksView() {
  const entry = currentEntry();
  ensureTaskState(entry);
  els.tasksView.innerHTML = "";

  const toolbar = document.createElement("div");
  toolbar.className = "task-toolbar";
  const summary = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = "Current task";
  const current = document.createElement("p");
  const focusTask = firstOpenTask();
  current.textContent = focusTask ? taskDisplayLine(focusTask) : "Nothing queued.";
  summary.append(title, current);
  const toolbarActions = document.createElement("div");
  toolbarActions.className = "task-toolbar-actions";
  const historyButton = document.createElement("button");
  historyButton.type = "button";
  historyButton.className = taskHistoryOpen ? "quiet active" : "quiet";
  historyButton.textContent = taskHistoryOpen ? "Back to tasks" : "History";
  historyButton.addEventListener("click", () => {
    taskHistoryOpen = !taskHistoryOpen;
    renderTasksView();
  });
  const hudButton = document.createElement("button");
  hudButton.type = "button";
  hudButton.className = "quiet";
  hudButton.textContent = "Open HUD";
  hudButton.addEventListener("click", openTaskHud);
  toolbarActions.append(historyButton, hudButton);
  toolbar.append(summary, toolbarActions);
  els.tasksView.append(toolbar);

  if (taskHistoryOpen) {
    els.tasksView.append(renderTaskHistoryPanel());
    return;
  }

  els.tasksView.append(createTaskAddForm({
    className: "task-quick-add",
    placeholder: "Set current task — 90m, 2pm, /W, #project, @label, p1",
    onSubmit: (value, disabled) => addTask("rightNow", value, { atFront: true, forceSection: true, disabled })
  }));

  const filterBar = document.createElement("div");
  filterBar.className = "task-filter-bar";
  for (const filter of TASK_FILTERS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = taskFilter === filter.key ? "active" : "";
    button.textContent = `${filter.label} ${taskFilterCount(filter.key, entry)}`;
    button.addEventListener("click", () => {
      taskFilter = filter.key;
      saveLocal();
      scheduleSettingsSave();
      renderTasksView();
    });
    filterBar.append(button);
  }
  els.tasksView.append(filterBar);

  // The deadline nag. It sits above every section and outside the filter,
  // because "no time booked for this yet" is true whichever slice of the task
  // list is on screen, and it disappears row by row as blocks get booked --
  // never by being dismissed.
  const unplannedDeadlines = upcomingDeadlineItems().filter((item) => !item.planned);
  if (unplannedDeadlines.length) els.tasksView.append(deadlinePlanPanel(unplannedDeadlines));

  for (const section of visibleTaskSections(entry)) {
    const virtualItems = section.virtualTasks || null;
    const taskItems = taskItemsForSection(entry, section, virtualItems);
    const panel = document.createElement("section");
    panel.className = "task-section";
    panel.dataset.section = section.key;
    if (section.key === "overdue") panel.classList.add("is-overdue");

    const head = document.createElement("div");
    head.className = "task-section-head";
    const heading = document.createElement("h3");
    heading.textContent = section.title;
    const count = document.createElement("span");
    count.textContent = `${taskItems.length}`;
    head.append(heading, count);
    panel.append(head);

    if (!virtualItems) {
      panel.append(createTaskAddForm({
        className: "task-add-row",
        placeholder: `Add to ${section.title.toLowerCase()}`,
        onSubmit: (value, disabled) => addTask(section.key, value, { disabled })
      }));
    }

    const list = document.createElement("div");
    list.className = "task-list";
    list.dataset.section = section.key;
    list.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (virtualItems) return;
      if (taskDragState?.liveReorder && taskDragState.sectionKey === section.key) previewTaskDrag(list, event.clientY);
    });
    list.addEventListener("drop", (event) => {
      event.preventDefault();
      if (virtualItems) return;
      const drag = taskDragState;
      // Committing re-renders and can detach the row before dragend fires, so the
      // drag state has to be released here rather than waiting for that event.
      taskDragState = null;
      const sourceSection = event.dataTransfer.getData("section");
      const sourceDate = event.dataTransfer.getData("sourceDate") || state.currentDate;
      const taskIdValue = event.dataTransfer.getData("taskId");
      if (!taskIdValue) return;
      if (sourceSection !== section.key) {
        moveTaskToSection(sourceSection, taskIdValue, section.key, sourceDate);
        return;
      }
      if (drag?.liveReorder) {
        commitTaskOrderFromRows(section.key, [...list.querySelectorAll(".task-row")], sourceDate);
        return;
      }
      const targetRow = event.target.closest(".task-row");
      moveTask(section.key, taskIdValue, targetRow?.dataset.taskId || null, sourceDate, targetRow?.dataset.sourceDate || sourceDate);
    });

    if (!taskItems.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = section.empty;
      list.append(empty);
    } else {
      // Live drag reorder only where stored order is what gets rendered.
      const canReorder = !virtualItems && (section.key === "today" || section.key === "rightNow");
      // Both reorderable sections render priority tiers, so drags stay in-tier.
      const tierLocked = canReorder;
      for (const item of taskItems) {
        list.append(taskRow(item.sectionKey, item.task, item.sourceDate || entry.date, { ...item, canReorder, tierLocked }));
      }
    }

    panel.append(list);
    els.tasksView.append(panel);
  }
}

function calendarEventId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `cal-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeCalendarEvents(events) {
  return rememberNormalizedCalendarEvents(
    (Array.isArray(events) ? events : []).map(normalizeCalendarEvent).filter(Boolean).sort(compareCalendarEvents)
  );
}

/* --- Titles that were written as sentences ----------------------------------

   A block gets its height from its duration, so a title typed like a journal
   entry has nowhere to go. Instead of letting the grid fight it forever, a long
   title is cut down to a headline here and the whole sentence is kept on the
   event as notes, where there is room for it. Nothing typed is lost: opening
   the event still shows every word, and hovering the block shows it too.

   It lives in normalizeCalendarEvent so it covers hand-typed events, blocks
   promoted from tasks and anything arriving from a sync, and it is idempotent
   -- a title that already fits is never touched, so re-normalising the stored
   events on every load does not keep chipping away at them.
--------------------------------------------------------------------------- */

const CALENDAR_TITLE_MAX_CHARS = 60;

function splitLongCalendarTitle(rawTitle, rawNotes) {
  const title = String(rawTitle || "").replace(/\s+/g, " ").trim();
  const notes = String(rawNotes || "").trim();
  if (title.length <= CALENDAR_TITLE_MAX_CHARS) return { title, notes };
  const head = title.slice(0, CALENDAR_TITLE_MAX_CHARS);
  // Prefer breaking where the writing already breaks -- end of a sentence or
  // clause -- then a word boundary, then a blind chop. Scripts written without
  // spaces fall through to the chop, which is the only honest option there.
  const clause = /^.*[.!?;:,。！？；，]/.exec(head)?.[0].length ?? -1;
  const boundary = clause > 0 ? clause : head.lastIndexOf(" ");
  // A break in the first few words leaves a uselessly short headline, so it is
  // only taken once it is far enough in to actually name the event.
  const chosen = boundary > CALENDAR_TITLE_MAX_CHARS * 0.4 ? boundary : CALENDAR_TITLE_MAX_CHARS;
  // Leaving room for the ellipsis is what makes this idempotent: the result has
  // to come back under the limit, or the next load shortens it again, and a
  // title with no break in it erodes a character at a time on every reload.
  const cut = Math.min(chosen, CALENDAR_TITLE_MAX_CHARS - 1);
  return {
    title: `${title.slice(0, cut).replace(/[\s.,;:。，；]+$/, "")}…`,
    notes: notes.includes(title) ? notes : [title, notes].filter(Boolean).join("\n\n")
  };
}

// The title on a shortened event is a headline; the words the user actually
// wrote are the first paragraph of its notes. Anything exporting off the
// calendar -- the time sheet above all -- wants those, not the headline.
function calendarEventFullTitle(event) {
  const title = String(event?.title || "");
  if (!title.endsWith("…")) return title;
  return String(event?.notes || "").split(/\n{2,}/)[0].trim() || title;
}

/* --- An event's relationship with time zones --------------------------------

   Three fields, and they answer three different questions:

   `zone`  -- what clock the stored start/end are written in. Provenance. An
              event written in Taipei says so, and nothing about it moves.
   `tz`    -- what the event is *pegged* to, empty for the floating default.
              A pegged event is a fixed instant wearing a local face: the call
              with the Taipei office is 09:00 there whatever country you are in,
              and it has to slide up the grid when you move. A floating one is
              a wall-clock promise -- the morning run is at seven wherever seven
              happens -- and must never move.
   `zoneShift` -- the rare one. This block is where a move happened: the flight,
              the drive, the ferry. It is what writes a row in the transition log.

   Pegged events are re-localised here, once, into the zone that was in force
   when they actually happened -- "as lived" -- rather than into whatever zone
   the laptop is in today. That choice is what keeps this idempotent and keeps
   the rest of the app simple: every clock in memory is the clock that was on the
   wall at the time, which is already true of every floating event, so the day
   index, the hour grids and the totals need to know nothing about any of this.
   Re-localising into the *viewing* zone instead would have been circular, since
   the view zone on "as lived" is itself decided by the event's date.

   Both *stored* endpoints always live in one zone, which is quietly the reason
   a flight comes out the right length: 09:00 Taipei to 13:40 Taipei is four
   hours forty, and it is the same four hours forty that a Bangkok clock calls
   12:40. But that is a storage fact, not what the person typed: a move is
   entered and shown the way its ticket reads -- Start in the departure zone's
   clock, End in the destination's -- and zoneShiftEndFromTicket() below is the
   one place that rewrites a ticket end into the start's zone. */

function normalizeEventZoneShift(raw) {
  if (!raw || typeof raw !== "object") return null;
  const from = isValidTimeZone(raw.from) ? String(raw.from).trim() : "";
  const to = isValidTimeZone(raw.to) ? String(raw.to).trim() : "";
  if (!from || !to || from === to) return null;
  // Where in the block the ground moved. "end" is the default because landing
  // is when you are somewhere else; a clock is for the odd case where you know
  // the moment (crossing a land border halfway through a drive).
  const raw_when = String(raw.when || "end").trim();
  const when = raw_when === "start" || /^\d{2}:\d{2}$/.test(raw_when) ? raw_when : "end";
  return { from, to, when };
}

/* A ticket end, rewritten into the zone the start is written in. `endTime` is
   the destination's clock. With no explicit end date, the date is settled by
   instant -- the first moment at or after departure wearing that clock, which is
   how a ticket's arrival time is read -- rather than by comparing clocks across
   two zones, which the date line can invert. */
function zoneShiftEndFromTicket(startWall, endTime, zone, shift, explicitEndDate = "") {
  const to = shift?.to;
  const clock = /^\d{2}:\d{2}$/.test(String(endTime || "")) ? endTime : "00:00";
  if (!isValidTimeZone(to)) return `${explicitEndDate || String(startWall).slice(0, 10)}T${clock}`;
  if (explicitEndDate) return convertZoneWallClock(`${explicitEndDate}T${clock}`, to, zone);
  const startInstant = zoneWallClockToInstant(startWall, zone);
  let date = String(startWall).slice(0, 10);
  let instant = zoneWallClockToInstant(`${date}T${clock}`, to);
  for (let hop = 0; hop < 2 && Number.isFinite(startInstant) && Number.isFinite(instant) && instant < startInstant; hop += 1) {
    date = shiftISODate(date, 1);
    instant = zoneWallClockToInstant(`${date}T${clock}`, to);
  }
  return convertZoneWallClock(`${date}T${clock}`, to, zone);
}

/* One row per real hour of a move, each labelled with both wall clocks at the
   top of the hour. Rows are indexed by hours since the start instant -- elapsed
   time, not any zone's clock -- which is what lets the transit log ignore the
   wormhole entirely: hour 7 of the flight is hour 7 whatever any clock says. */
function transitHourRows(startInstant, endInstant, fromZone, toZone) {
  if (!Number.isFinite(startInstant) || !Number.isFinite(endInstant) || endInstant <= startInstant) return [];
  const count = Math.min(48, Math.ceil((endInstant - startInstant) / 3600000));
  const rows = [];
  for (let index = 0; index < count; index += 1) {
    const at = startInstant + index * 3600000;
    rows.push({
      fromClock: instantToZoneWallClock(at, fromZone).slice(11, 16),
      toClock: instantToZoneWallClock(at, toZone).slice(11, 16),
      minutes: Math.min(60, Math.round((endInstant - at) / 60000))
    });
  }
  return rows;
}

function normalizeCalendarEvent(event) {
  if (!event || typeof event !== "object") return null;
  const { title, notes } = splitLongCalendarTitle(event.title, event.notes);
  let start = normalizeCalendarDateTime(event.start);
  if (!title || !start) return null;
  let end = normalizeCalendarDateTime(event.end) || start;
  const tz = isValidTimeZone(event.tz) ? String(event.tz).trim() : "";
  const zoneShift = normalizeEventZoneShift(event.zoneShift);
  // A pegged event with no provenance is reading its own peg: "09:00 Taipei"
  // stored before this field existed means the 09:00 is a Taipei 09:00.
  let zone = isValidTimeZone(event.zone) ? String(event.zone).trim() : tz || (zoneShift ? zoneShift.from : "");
  if (tz && zone) {
    const lived = calendarViewZone(zoneWallClockToInstant(start, zone));
    if (lived && lived !== zone) {
      // Both ends shift together, so nothing here can invert the pair.
      start = convertZoneWallClock(start, zone, lived);
      end = convertZoneWallClock(end, zone, lived);
      zone = lived;
    }
  }
  const category = CALENDAR_CATEGORIES.some((item) => item.code === event.category) ? event.category : "";
  const color = categoryColor(category) || (/^#[a-f0-9]{6}$/i.test(String(event.color || "")) ? event.color : CALENDAR_COLORS[0]);
  const repeatDays = Array.isArray(event.repeatDays)
    ? [...new Set(event.repeatDays.map(Number).filter((day) => day >= 0 && day <= 6))].sort((a, b) => a - b)
    : [];
  const exceptionDates = Array.isArray(event.exceptionDates)
    ? [...new Set(event.exceptionDates.filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))))].sort()
    : [];
  /* The transit log: one line per real hour of a zone-shift block, indexed by
     hours since the start instant. Elapsed time, not any zone's clock, which is
     what lets it ignore the wormhole entirely. See transitLogControls(). */
  const transitLog = Array.isArray(event.transitLog)
    ? event.transitLog.slice(0, 48).map((line) => String(line || "").trim())
    : [];
  while (transitLog.length && !transitLog[transitLog.length - 1]) transitLog.pop();
  const now = new Date().toISOString();
  const kind = event.kind === "actual" ? "actual" : event.kind === "deadline" ? "deadline" : "plan";
  return {
    id: event.id || calendarEventId(),
    title,
    start,
    // A deadline is a moment, not a span: its start IS the due time, and any
    // end that drifted in (a resize on an old client, a sync echo) is dropped
    // so it can never grow into a block.
    end: kind === "deadline" ? start : end < start ? start : end,
    allDay: Boolean(event.allDay),
    kind,
    // Only a plan can be tentative: an actual either happened or it did not,
    // and a deadline is somebody else's fact about the world.
    tentative: kind === "plan" && Boolean(event.tentative),
    // A plan that reality overtook: the ISO stamp of the moment "Re-plan"
    // archived it. Empty = the plan currently in force. Every block archived
    // together shares one stamp, which is what groups them into one rail on
    // the left of the day column. Like taskId, it must exist in both
    // normalisers or a save would silently resurrect every old plan.
    supersededAt: kind === "plan" && event.supersededAt ? String(event.supersededAt).trim() : "",
    // On a deadline: how long the work is expected to take, which is what sizes
    // the plan block placed from it. Same 0 = "not estimated" rule as tasks.
    estimateMinutes: normalizeEstimateMinutes(event.estimateMinutes),
    // Set when the block came from a task, so the task list can show at a glance
    // that it already has a time. Empty for every hand-made event.
    taskId: String(event.taskId || "").trim(),
    // Set on a plan block placed from a deadline. This link is what clears the
    // deadline out of "Deadlines to plan", so like taskId it must exist in both
    // normalisers or a save would silently un-plan every deadline.
    deadlineId: String(event.deadlineId || "").trim(),
    category,
    // An event's own data is never the thing to correct from a settings file:
    // a client that boots without the server holds compiled-in defaults, and
    // letting those rewrite event fields silently loses real data.
    location: String(event.location || "").trim(),
    link: String(event.link || "").trim(),
    notes,
    recurrence: CALENDAR_RECURRENCE_OPTIONS.some((item) => item.value === event.recurrence) ? event.recurrence : "none",
    repeatDays,
    recurrenceEndDate: /^\d{4}-\d{2}-\d{2}$/.test(String(event.recurrenceEndDate || "")) ? String(event.recurrenceEndDate) : "",
    exceptionDates,
    color,
    // See the note above normalizeEventZoneShift: provenance, peg, and the rare
    // block that is itself a move.
    zone,
    tz,
    zoneShift,
    transitLog,
    source: String(event.source || "local"),
    calendarId: String(event.calendarId || "local"),
    providerId: event.providerId || null,
    // Mirrors server.cjs: the Google event this plan block was pushed up as.
    // The app never sets it -- only the sync does -- but it must survive every
    // local edit, or the next sync creates a duplicate instead of updating.
    googleEventId: event.googleEventId ? String(event.googleEventId) : "",
    createdAt: event.createdAt || now,
    updatedAt: event.updatedAt || now
  };
}

// The instant an event's clock actually names, which needs its zone. Floating
// events have no zone of their own, so they are read in the zone that was in
// force on their date -- the clock on the wall is the clock that was lived.
function calendarEventZone(event) {
  return event?.zone || zoneForDate(String(event?.start || "").slice(0, 10));
}

function calendarEventStartInstant(event) {
  return zoneWallClockToInstant(event?.start, calendarEventZone(event));
}

function calendarEventEndInstant(event) {
  return zoneWallClockToInstant(event?.end || event?.start, calendarEventZone(event));
}

/* The wall clock a block's zone shift happened at, expressed in the zone being
   left, which is the form the transition log stores. */
function calendarEventShiftWallClock(event) {
  const shift = event?.zoneShift;
  if (!shift) return "";
  const zone = calendarEventZone(event);
  const wall =
    shift.when === "start"
      ? event.start
      : shift.when === "end"
        ? event.end || event.start
        : `${String(event.start).slice(0, 10)}T${shift.when}`;
  // A typed clock earlier than the block's own start belongs to the day it ends
  // on -- the overnight flight that crosses at 01:30.
  const settled = wall < event.start && /^\d{2}:\d{2}$/.test(String(shift.when)) ? `${String(event.end || event.start).slice(0, 10)}T${shift.when}` : wall;
  return convertZoneWallClock(normalizeCalendarDateTime(settled), zone, shift.from);
}

function normalizeCalendarDateTime(value) {
  const text = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return `${text}T00:00`;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(text)) return text;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(text)) return text.slice(0, 16);
  return "";
}

function compareCalendarEvents(a, b) {
  if (a.start !== b.start) return a.start.localeCompare(b.start);
  return a.title.localeCompare(b.title);
}

function categoryColor(code) {
  return CALENDAR_CATEGORIES.find((category) => category.code === code)?.color || "";
}

function categoryLabel(code) {
  return CALENDAR_CATEGORIES.find((category) => category.code === code)?.label || "";
}

// Only the plan-only view is about planning ahead; on "both" (and "actual") a
// new block is almost always a record of what just happened, so it starts as
// actual and the kind radio can still be flipped before saving.
function defaultCalendarKind() {
  return calendarKindFilter === "plan" ? "plan" : "actual";
}

function defaultCalendarEvent(date = calendarCursorDate || state.currentDate || todayISO()) {
  return {
    id: "new",
    title: "",
    start: `${date}T09:00`,
    end: `${date}T10:00`,
    allDay: false,
    kind: defaultCalendarKind(),
    tentative: false,
    estimateMinutes: 0,
    taskId: "",
    deadlineId: "",
    category: "",
    location: "",
    link: "",
    notes: "",
    recurrence: "none",
    repeatDays: [],
    exceptionDates: [],
    color: CALENDAR_COLORS[0],
    source: "local",
    calendarId: "local",
    providerId: null,
    googleEventId: ""
  };
}

function renderCalendarConnectionsSurface() {
  if (activeView === "calendar") renderCalendarView();
  if (activeView === "settings") renderSettingsView();
}

// Events imported from a provider are read-only here: the app never writes back,
// so letting them be edited or dragged would only invent differences that the
// next sync silently reverts.
function isSyncedCalendarEvent(event) {
  return event?.source === "google" || event?.source === "outlook";
}

function renderSettingsView() {
  els.settingsView.innerHTML = "";
  const intro = document.createElement("section");
  intro.className = "settings-intro";
  intro.innerHTML = `
    <span class="settings-eyebrow">Connections</span>
    <h3>Google Calendar</h3>
    <p>Connect your calendar with a Google OAuth client. Google does not allow private calendar access with an API key alone, so this uses a client ID and client secret and stores them only on this computer.</p>
    <p>Sync runs both ways: Google events come in, and plan blocks written from now on go out to your primary calendar. Actuals and archived old plans stay here.</p>
    ${googleCalendarStatus?.connected && !googleCalendarStatus?.canPush
      ? `<p class="settings-warning">This connection was made read-only, so nothing can be written to Google. Connect the account again to allow the push.</p>`
      : ""}
  `;

  const steps = document.createElement("ol");
  steps.className = "settings-steps";
  steps.innerHTML = `
    <li>In Google Cloud, enable the Google Calendar API and create an OAuth client for a web application.</li>
    <li>Add the redirect URI shown below to the OAuth client's authorized redirect URIs.</li>
    <li>Paste the client ID and secret, save, then connect your Google account.</li>
    <li>Set the OAuth consent screen to <strong>In production</strong>. Left in Testing, Google expires the refresh token after 7 days and the sync dies silently.</li>
  `;
  intro.append(steps);

  const outlookIntro = document.createElement("section");
  outlookIntro.className = "settings-intro";
  outlookIntro.innerHTML = `
    <span class="settings-eyebrow">Connections</span>
    <h3>Outlook Calendar</h3>
    <p>Connect an Outlook, Microsoft 365, or work calendar through the Microsoft Graph API. Like Google, this needs an app registration of your own; the credentials stay on this computer.</p>
  `;
  const outlookSteps = document.createElement("ol");
  outlookSteps.className = "settings-steps";
  outlookSteps.innerHTML = `
    <li>In the Microsoft Entra admin center (entra.microsoft.com), register a new application with a Web platform.</li>
    <li>Add the redirect URI shown below, then create a client secret under Certificates &amp; secrets.</li>
    <li>Paste the application (client) ID and secret value, save, then connect your Microsoft account.</li>
  `;
  outlookIntro.append(outlookSteps);

  const spotifyIntro = document.createElement("section");
  spotifyIntro.className = "settings-intro";
  spotifyIntro.innerHTML = `
    <span class="settings-eyebrow">Connections</span>
    <h3>Spotify</h3>
    <p>Logs every track Spotify reports as played to <code>spotify-listens.json</code>, one row per play. The journal server pulls the recent-plays list every ${spotifyStatus?.pollMinutes || 10} minutes while it is running; nothing is written to Spotify.</p>
    ${spotifyStatus?.needsReconnect
      ? `<p class="settings-warning">Spotify rejected the saved sign-in, so logging has stopped. Connect the account again to resume.</p>`
      : spotifyStatus?.lastError
        ? `<p class="settings-warning">Last fetch failed: ${docEscapeHtml(spotifyStatus.lastError)}</p>`
        : ""}
  `;
  const spotifySteps = document.createElement("ol");
  spotifySteps.className = "settings-steps";
  spotifySteps.innerHTML = `
    <li>At developer.spotify.com/dashboard, create an app (any name; Web API is enough).</li>
    <li>Add the redirect URI shown below exactly. Spotify rejects <code>localhost</code>, so it must be the 127.0.0.1 form.</li>
    <li>Paste the client ID and secret from the app's settings, save, then connect your Spotify account.</li>
  `;
  spotifyIntro.append(spotifySteps);

  els.settingsView.append(
    intro,
    googleCalendarPanel({ standalone: true }),
    outlookIntro,
    outlookCalendarPanel({ standalone: true }),
    spotifyIntro,
    spotifyPanel(),
    timeZonesPanel(),
    questionTypesPanel(),
    celebrationsPanel(),
    rulesForLifePanel()
  );
}

/* --- Which question types the survey editor offers --------------------------

   Eleven types are standard and always in the picker. The rest are here
   because they were in the survey this grew out of and might one day be
   wanted, not because a
   daily journal needs a heat map -- so they start off, and switching one on is
   the user saying otherwise.

   Turning a type *off* only takes it out of the picker. A question already
   using it keeps rendering and keeps its answers: a toggle in Settings that
   could silently break a question already in the night survey would be a much
   worse thing than a slightly long list.
--------------------------------------------------------------------------- */

function questionTypesPanel() {
  const panel = document.createElement("section");
  panel.className = "settings-intro question-types-panel";
  const heading = document.createElement("div");
  heading.innerHTML = `
    <span class="settings-eyebrow">Surveys</span>
    <h3>Survey question types</h3>
    <p>What the "Add a question" picker offers inside the morning and night surveys. The standard types are always there. Switch on anything else you want available. Turning one off only hides it from the picker — a question already using it keeps working.</p>
  `;
  panel.append(heading);

  const standard = document.createElement("div");
  standard.className = "question-type-standard";
  const standardTitle = document.createElement("strong");
  standardTitle.textContent = "Always available";
  standard.append(standardTitle);
  const standardList = document.createElement("p");
  standardList.className = "question-type-standard-list";
  standardList.textContent = QUESTION_TYPES.filter((type) => type.tier === "standard")
    .map((type) => type.label)
    .join(" · ");
  standard.append(standardList);
  panel.append(standard);

  const list = document.createElement("div");
  list.className = "celebration-options question-type-options";
  for (const type of QUESTION_TYPES.filter((item) => item.tier === "optional")) {
    const row = document.createElement("label");
    row.className = "celebration-option";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = enabledQuestionTypes[type.key] === true;
    checkbox.addEventListener("change", () => {
      enabledQuestionTypes[type.key] = checkbox.checked;
      scheduleSettingsSave();
      updateQuestionTypesHint(panel);
    });
    const text = document.createElement("span");
    text.className = "celebration-option-text";
    const label = document.createElement("strong");
    label.textContent = type.label;
    const description = document.createElement("small");
    description.textContent = type.description;
    text.append(label, description);
    row.append(checkbox, text);
    list.append(row);
  }
  panel.append(list);

  const hint = document.createElement("p");
  hint.className = "celebration-hint";
  panel.append(hint);
  updateQuestionTypesHint(panel);
  return panel;
}

function updateQuestionTypesHint(panel) {
  const hint = panel.querySelector(".celebration-hint");
  if (!hint) return;
  const optional = QUESTION_TYPES.filter((type) => type.tier === "optional");
  const on = optional.filter((type) => enabledQuestionTypes[type.key] === true).length;
  const standardCount = QUESTION_TYPES.filter((type) => type.tier === "standard").length;
  hint.textContent = on
    ? `${standardCount + on} types in the picker — the ${standardCount} standard ones plus ${on} switched on here.`
    : `Just the ${standardCount} standard types in the picker.`;
}

/* --- Time zones -------------------------------------------------------------

   The log is normally written from the calendar -- tick the globe on the flight
   and the row appears -- so this panel is the place for the two cases that
   cannot come from a block: a move with no flight on the calendar, and fixing a
   row whose clock was a guess.

   It is also where the year's arithmetic is shown, because that is the whole
   point of keeping the log. A year of travel is a year that did not contain
   365 x 24 hours, and until something says so out loud, every average computed
   over it is quietly wrong.
--------------------------------------------------------------------------- */

function timeZoneYearSummary(year = String(todayISO()).slice(0, 4)) {
  const first = `${year}-01-01`;
  const last = `${year}-12-31` < todayISO() ? `${year}-12-31` : todayISO();
  if (last < first) return null;
  const days = new Map();
  const minutes = new Map();
  let dateCount = 0;
  let realMinutes = 0;
  let travelDays = 0;
  let skippedDays = 0;
  for (let date = first; date <= last; date = shiftISODate(date, 1)) {
    dateCount += 1;
    const segments = dateZoneSegments(date);
    if (segments.length > 1) travelDays += 1;
    if (!segments.length) skippedDays += 1;
    const zone = zoneForDate(date);
    days.set(zone, (days.get(zone) || 0) + 1);
    for (const segment of segments) {
      minutes.set(segment.zone, (minutes.get(segment.zone) || 0) + segment.realMinutes);
      realMinutes += segment.realMinutes;
    }
  }
  return {
    year,
    dateCount,
    realMinutes,
    travelDays,
    skippedDays,
    // What travel did to the year: negative means the clock took hours away.
    driftMinutes: realMinutes - dateCount * 1440,
    zones: [...days.entries()]
      .map(([zone, count]) => ({ zone, days: count, minutes: minutes.get(zone) || 0 }))
      .sort((a, b) => b.days - a.days)
  };
}

function formatZoneDrift(minutes) {
  if (!minutes) return "nothing gained or lost";
  const hours = Math.round((Math.abs(minutes) / 60) * 10) / 10;
  return `${hours}h ${minutes < 0 ? "lost" : "gained"} to travel`;
}

function timeZonesPanel() {
  const panel = document.createElement("section");
  panel.className = "settings-intro timezone-panel";
  const heading = document.createElement("div");
  heading.innerHTML = `
    <span class="settings-eyebrow">Time</span>
    <h3>Time zones</h3>
    <p>Every zone change you have recorded, each pinned to the moment it happened. Most of these are written by ticking the globe on the flight in the calendar; add one here when there was no block for it. The year's hours are counted from this list, so a wrong time here is a wrong total everywhere.</p>
  `;
  panel.append(heading);

  const suggestion = timeZoneSuggestionRow();
  if (suggestion) panel.append(suggestion);
  panel.append(favoriteTimeZonesBlock());

  const list = document.createElement("div");
  list.className = "timezone-rows";
  if (!zoneTransitions.length) {
    const empty = document.createElement("p");
    empty.className = "timezone-empty";
    empty.textContent = zoneTransitionsLoaded
      ? `No moves recorded. Everything is counted in ${zoneCityLabel(currentTimeZone())} time.`
      : "The server has not answered yet, so nothing here can be edited.";
    list.append(empty);
  }
  for (const row of zoneTransitions) list.append(timeZoneRow(row));
  panel.append(list, timeZoneAddForm());

  const summary = timeZoneYearSummary();
  if (summary && summary.zones.length) panel.append(timeZoneSummaryBlock(summary));
  return panel;
}

/* The device noticed a change; the device does not get to write it down. A
   laptop that was shut for the flight, a VPN, or a machine whose zone was set by
   hand can all say the wrong thing, and a wrong row here bends a year of totals.
   So it asks, with the clock left for the user to fill in. */
function timeZoneSuggestionRow() {
  if (!deviceZoneSuggestion || !zoneTransitionsLoaded) return null;
  const { from, to } = deviceZoneSuggestion;
  if (!isValidTimeZone(from) || !isValidTimeZone(to) || from === to) return null;
  const row = document.createElement("form");
  row.className = "timezone-suggestion";
  const text = document.createElement("p");
  text.textContent = `This computer is set to ${zoneCityLabel(to)}, but the log still has you in ${zoneCityLabel(from)}. When did you change?`;
  const when = document.createElement("input");
  when.type = "datetime-local";
  when.required = true;
  when.value = `${todayISO()}T12:00`;
  when.setAttribute("aria-label", `When you moved from ${zoneCityLabel(from)} to ${zoneCityLabel(to)}`);
  const save = document.createElement("button");
  save.type = "submit";
  save.textContent = "Record it";
  const dismiss = document.createElement("button");
  dismiss.type = "button";
  dismiss.className = "quiet";
  dismiss.textContent = "Not now";
  dismiss.addEventListener("click", () => {
    deviceZoneSuggestion = null;
    renderSettingsView();
  });
  row.addEventListener("submit", async (event) => {
    event.preventDefault();
    const at = normalizeCalendarDateTime(when.value);
    if (!at) return;
    applyZoneTransitionRows([...zoneTransitions, { from, to, at, source: "device" }]);
    deviceZoneSuggestion = null;
    await saveTimezoneHistory();
    renderSettingsView();
    render();
  });
  row.append(text, when, save, dismiss);
  return row;
}

/* The starred list, and the only place to take something off it. Adding happens
   wherever a zone is being picked -- the star next to any zone dropdown -- since
   that is the moment you know you want it again. */
function favoriteTimeZonesBlock() {
  const block = document.createElement("div");
  block.className = "timezone-favorites";
  const title = document.createElement("h4");
  title.textContent = "My time zones";
  const note = document.createElement("p");
  note.textContent = "These sit at the top of every zone dropdown in the app. Star a zone anywhere you pick one to add it here.";
  block.append(title, note);

  const chips = document.createElement("div");
  chips.className = "timezone-favorite-chips";
  const derived = knownZoneNames().filter((zone) => !favoriteTimeZones.includes(zone));
  for (const zone of favoriteTimeZones) {
    const chip = document.createElement("span");
    chip.className = "timezone-chip";
    chip.textContent = `${zoneCityLabel(zone)} · ${zoneOffsetLabel(zoneOffsetMinutes(zone, Date.now()))}`;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "timezone-chip-remove";
    remove.textContent = "×";
    remove.title = `Remove ${zoneCityLabel(zone)}`;
    remove.setAttribute("aria-label", `Remove ${zoneCityLabel(zone)} from your time zones`);
    remove.addEventListener("click", () => {
      toggleFavoriteTimeZone(zone);
      renderSettingsView();
    });
    chip.append(remove);
    chips.append(chip);
  }
  /* Zones the app already knows you use, shown as unstarred chips. Nothing is
     lost by not starring them -- they are in the top group either way -- but
     starring pins them there even after the last event using them is gone. */
  for (const zone of derived) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "timezone-chip is-derived";
    chip.textContent = `☆ ${zoneCityLabel(zone)} · ${zoneOffsetLabel(zoneOffsetMinutes(zone, Date.now()))}`;
    chip.title = `In use here. Star it to keep ${zoneCityLabel(zone)} on the list for good.`;
    chip.addEventListener("click", () => {
      toggleFavoriteTimeZone(zone);
      renderSettingsView();
    });
    chips.append(chip);
  }
  if (!chips.childElementCount) {
    const empty = document.createElement("p");
    empty.className = "timezone-empty";
    empty.textContent = "Nothing starred yet.";
    chips.append(empty);
  }
  block.append(chips);

  const add = document.createElement("div");
  add.className = "timezone-favorite-add";
  add.append(labelledControl("Add a zone", zoneSelect("favoriteZone", "")));
  block.append(add);
  return block;
}

function timeZoneRow(transition) {
  const row = document.createElement("div");
  row.className = "timezone-row";
  row.classList.toggle("is-approximate", transition.approximate);
  const route = document.createElement("strong");
  route.textContent = `${zoneCityLabel(transition.from)} → ${zoneCityLabel(transition.to)}`;
  const instant = Date.parse(transition.atInstant);
  const detail = document.createElement("span");
  detail.className = "timezone-row-detail";
  detail.textContent = `${transition.at.replace("T", " ")} ${zoneCityLabel(transition.from)} · ${instantToZoneWallClock(instant, transition.to).replace("T", " ")} ${zoneCityLabel(transition.to)}`;

  const when = document.createElement("input");
  when.type = "datetime-local";
  when.value = transition.at;
  when.setAttribute("aria-label", `When you moved from ${zoneCityLabel(transition.from)} to ${zoneCityLabel(transition.to)}`);
  when.addEventListener("change", async () => {
    const at = normalizeCalendarDateTime(when.value);
    if (!at) return;
    applyZoneTransitionRows(zoneTransitions.map((item) => (item.id === transition.id ? { ...item, at, approximate: false } : item)));
    await saveTimezoneHistory();
    renderSettingsView();
    render();
  });

  const note = document.createElement("span");
  note.className = "timezone-row-note";
  if (transition.eventId) {
    // The block owns it, so this is a pointer back to the block rather than a
    // second place to edit the same fact.
    const event = (state.calendarEvents || []).find((item) => item.id === transition.eventId);
    note.textContent = event ? `from “${event.title}” on the calendar` : "from a calendar block";
  } else if (transition.approximate) {
    note.textContent = "time is a guess — set it";
  } else if (transition.source === "device") {
    note.textContent = "noticed by this computer";
  }

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "quiet danger";
  remove.textContent = "Remove";
  remove.addEventListener("click", async () => {
    applyZoneTransitionRows(zoneTransitions.filter((item) => item.id !== transition.id));
    await saveTimezoneHistory();
    renderSettingsView();
    render();
  });

  row.append(route, detail, when, note, remove);
  return row;
}

function timeZoneAddForm() {
  const form = document.createElement("form");
  form.className = "timezone-add";
  const lastZone = zoneTransitions.length ? zoneTransitions[zoneTransitions.length - 1].to : currentTimeZone();
  const from = zoneSelect("addFrom", lastZone);
  const to = zoneSelect("addTo", currentTimeZone() === lastZone ? "" : currentTimeZone());
  const when = document.createElement("input");
  when.type = "datetime-local";
  when.value = `${todayISO()}T12:00`;
  when.setAttribute("aria-label", "When the change happened");
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.textContent = "Add a move";
  const error = document.createElement("p");
  error.className = "timezone-error";
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const at = normalizeCalendarDateTime(when.value);
    if (!at || from.value === to.value || !isValidTimeZone(from.value) || !isValidTimeZone(to.value)) {
      error.textContent = "Pick two different zones and the moment you changed between them.";
      return;
    }
    error.textContent = "";
    applyZoneTransitionRows([...zoneTransitions, { from: from.value, to: to.value, at, source: "manual" }]);
    await saveTimezoneHistory();
    renderSettingsView();
    render();
  });
  form.append(
    labelledControl("From", from),
    labelledControl("To", to),
    labelledControl("When", when),
    submit,
    error
  );
  return form;
}

function timeZoneSummaryBlock(summary) {
  const block = document.createElement("div");
  block.className = "timezone-summary";
  const title = document.createElement("h4");
  title.textContent = `${summary.year} so far`;
  const total = document.createElement("p");
  const hours = Math.round(summary.realMinutes / 60);
  total.textContent = `${summary.dateCount} dates, ${hours.toLocaleString()} hours actually lived — ${formatZoneDrift(summary.driftMinutes)}${
    summary.travelDays ? `, across ${summary.travelDays} travel day${summary.travelDays === 1 ? "" : "s"}` : ""
  }${summary.skippedDays ? `, and ${summary.skippedDays} date${summary.skippedDays === 1 ? "" : "s"} that never happened` : ""}.`;
  block.append(title, total);
  const list = document.createElement("ul");
  list.className = "timezone-summary-zones";
  for (const zone of summary.zones) {
    const item = document.createElement("li");
    item.textContent = `${zoneCityLabel(zone.zone)} — ${zone.days} day${zone.days === 1 ? "" : "s"}, ${Math.round(zone.minutes / 60).toLocaleString()}h (${zoneOffsetLabel(zoneOffsetMinutes(zone.zone, Date.now()))})`;
    list.append(item);
  }
  block.append(list);
  return block;
}

function celebrationsPanel() {
  const panel = document.createElement("section");
  panel.className = "settings-intro celebrations-panel";

  const heading = document.createElement("div");
  heading.innerHTML = `
    <span class="settings-eyebrow">Task HUD</span>
    <h3>Completion animations</h3>
    <p>One of these plays at random when you check off a task in the floating HUD. Turn off any you do not want in the rotation. Changes apply on the next completion, no HUD restart needed.</p>
  `;
  panel.append(heading);

  const list = document.createElement("div");
  list.className = "celebration-options";
  for (const kind of CELEBRATION_KINDS) {
    const row = document.createElement("label");
    row.className = "celebration-option";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = celebrations[kind.key] !== false;
    checkbox.addEventListener("change", () => {
      celebrations[kind.key] = checkbox.checked;
      scheduleSettingsSave();
      updateCelebrationsHint(panel);
    });

    const text = document.createElement("span");
    text.className = "celebration-option-text";
    const label = document.createElement("strong");
    label.textContent = kind.label;
    const description = document.createElement("small");
    description.textContent = kind.description;
    text.append(label, description);

    row.append(checkbox, text);
    list.append(row);
  }
  panel.append(list);

  const hint = document.createElement("p");
  hint.className = "celebration-hint";
  panel.append(hint);
  updateCelebrationsHint(panel);

  return panel;
}

function updateCelebrationsHint(panel) {
  const hint = panel.querySelector(".celebration-hint");
  if (!hint) return;
  const enabled = CELEBRATION_KINDS.filter((kind) => celebrations[kind.key] !== false).length;
  if (enabled === 0) hint.textContent = "All animations are off, so completing a task will not play anything.";
  else if (enabled === 1) hint.textContent = "Only one animation is on, so it will play every time.";
  else hint.textContent = `${enabled} animations in the rotation. The same one never plays twice in a row.`;
}

/* --- Rules for life ---------------------------------------------------------

   The roster behind the rule of the day. Rules are goals of type "rule" in
   goals.json, and the monthly schedule is frozen once built so past days keep
   the rule they were actually shown. That freeze is why every roster edit here
   goes through rebuildFutureRuleSchedule(): the schedule from tomorrow on is
   thrown away and re-dealt, and everything up to and including today stands.

   Retire vs Remove follows one rule: a rule that was ever shown
   on a day or rated is history and can only be retired (archived, so old
   entries still resolve its title); one that never reached a day can be
   deleted outright, which is the typo case.
--------------------------------------------------------------------------- */

function ruleHasHistory(id) {
  if (goalLog.some((event) => event.goalId === id)) return true;
  const today = todayISO();
  return Object.entries(goalsDoc.ruleSchedule || {}).some(([date, ruleId]) => ruleId === id && date <= today);
}

function rebuildFutureRuleSchedule() {
  const schedule = goalsDoc.ruleSchedule || (goalsDoc.ruleSchedule = {});
  const today = todayISO();
  for (const date of Object.keys(schedule)) {
    if (date > today) delete schedule[date];
  }
  const tomorrow = shiftISODate(today, 1);
  const next = new Date(Number(tomorrow.slice(0, 4)), Number(tomorrow.slice(5, 7)), 1);
  buildRuleScheduleForMonth(tomorrow);
  buildRuleScheduleForMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-01`);
  persistGoalsDoc();
}

function rulesForLifePanel() {
  const panel = document.createElement("section");
  panel.className = "settings-intro rules-panel";
  const heading = document.createElement("div");
  heading.innerHTML = `
    <span class="settings-eyebrow">Goals</span>
    <h3>Rules for life</h3>
    <p>The roster behind the rule of the day. Any change here re-deals the schedule from tomorrow on; past days, and today, keep the rule they were actually shown.</p>
  `;
  panel.append(heading);

  if (!goalsDocLoaded) {
    const note = document.createElement("p");
    note.className = "rules-empty";
    note.textContent = "The journal server has not answered yet, so nothing here can be edited.";
    panel.append(note);
    return panel;
  }

  const list = document.createElement("div");
  list.className = "rule-rows";
  const active = goalsDoc.goals.filter((goal) => goal.type === "rule" && !goal.archived);
  for (const rule of active) list.append(ruleRow(rule));
  if (!active.length) {
    const empty = document.createElement("p");
    empty.className = "rules-empty";
    empty.textContent = "No active rules. Add one below and it enters the rotation tomorrow.";
    list.append(empty);
  }
  panel.append(list);

  const form = document.createElement("form");
  form.className = "rule-add";
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Add a rule";
  input.setAttribute("aria-label", "New rule for life");
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.textContent = "Add";
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = input.value.trim();
    if (!title) return;
    const base = `rule-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "new"}`;
    let id = base;
    for (let i = 2; goalById(id); i += 1) id = `${base}-${i}`;
    goalsDoc.goals.push({
      id,
      title,
      category: "MENTAL HEALTH (HABITS)",
      type: "rule",
      target: null,
      contexts: [...(goalsDoc.contexts || [])],
      priority: 1,
      source: null,
      order: goalsDoc.goals.reduce((max, goal) => Math.max(max, Number(goal.order) || 0), -1) + 1,
      activeFrom: todayISO(),
      activeTo: null,
      archived: false
    });
    rebuildFutureRuleSchedule();
    input.value = "";
    renderSettingsView();
    render();
  });
  form.append(input, submit);
  panel.append(form);

  const retired = goalsDoc.goals.filter((goal) => goal.type === "rule" && goal.archived);
  if (retired.length) {
    const block = document.createElement("div");
    block.className = "rule-retired";
    const title = document.createElement("h4");
    title.textContent = "Retired";
    block.append(title);
    for (const rule of retired) {
      const row = document.createElement("div");
      row.className = "rule-retired-row";
      const name = document.createElement("span");
      name.textContent = rule.title;
      const restore = document.createElement("button");
      restore.type = "button";
      restore.className = "quiet";
      restore.textContent = "Bring back";
      restore.addEventListener("click", () => {
        rule.archived = false;
        rule.activeTo = null;
        rebuildFutureRuleSchedule();
        renderSettingsView();
        render();
      });
      row.append(name, restore);
      block.append(row);
    }
    panel.append(block);
  }
  return panel;
}

function ruleRow(rule) {
  const row = document.createElement("div");
  row.className = "rule-row";

  const title = document.createElement("input");
  title.type = "text";
  title.value = rule.title;
  title.setAttribute("aria-label", `Wording of the rule “${rule.title}”`);
  title.addEventListener("change", () => {
    const value = title.value.trim();
    if (!value || value === rule.title) {
      title.value = rule.title;
      return;
    }
    // A reword follows the rule everywhere, past days included — the id, not
    // the wording, is what the schedule and the ratings point at.
    rule.title = value;
    persistGoalsDoc();
    render();
  });

  const weight = document.createElement("input");
  weight.type = "number";
  weight.min = "1";
  weight.max = "9";
  weight.step = "1";
  weight.value = String(Number(rule.weight) || 1);
  weight.title = "Weight — when the month's days don't divide evenly, higher-weight rules take the leftover days first.";
  weight.setAttribute("aria-label", `Weight of “${rule.title}” in the monthly schedule`);
  weight.addEventListener("change", () => {
    const value = Math.max(1, Math.min(9, Math.round(Number(weight.value) || 1)));
    weight.value = String(value);
    if (value === (Number(rule.weight) || 1)) return;
    rule.weight = value;
    rebuildFutureRuleSchedule();
    renderSettingsView();
  });

  const drop = document.createElement("button");
  drop.type = "button";
  drop.className = "quiet danger";
  if (ruleHasHistory(rule.id)) {
    drop.textContent = "Retire";
    drop.title = "Drops the rule from future days. Days already lived keep it, and it can be brought back later.";
    drop.addEventListener("click", () => {
      rule.archived = true;
      rule.activeTo = todayISO();
      rebuildFutureRuleSchedule();
      renderSettingsView();
      render();
    });
  } else {
    drop.textContent = "Remove";
    drop.title = "This rule has never been shown on a day, so it can be deleted outright.";
    drop.addEventListener("click", () => {
      goalsDoc.goals = goalsDoc.goals.filter((goal) => goal.id !== rule.id);
      rebuildFutureRuleSchedule();
      renderSettingsView();
      render();
    });
  }

  row.append(title, weight, drop);
  return row;
}

function renderCalendarView() {
  ensureCalendarState();
  calendarCursorDate = /^\d{4}-\d{2}-\d{2}$/.test(calendarCursorDate) ? calendarCursorDate : state.currentDate || todayISO();
  const scrollTop = els.calendarView.scrollTop;
  const scrollLeft = els.calendarView.scrollLeft;
  resetCalendarTextFitObserver();
  els.calendarView.innerHTML = "";
  const toolbar = calendarToolbar();
  els.calendarView.append(toolbar);
  els.calendarView.style.setProperty("--calendar-toolbar-height", `${toolbar.offsetHeight}px`);
  applyCalendarZoom();
  if (editingCalendarEventId) els.calendarView.append(calendarEditor());
  if (calendarMode === "month") renderCalendarMonth();
  else if (calendarMode === "day") renderCalendarDay();
  else renderCalendarWeek();
  renderMiniRow();
  renderPersistentDraftPreview();
  fitCalendarEventText();
  els.calendarView.scrollTo({ top: scrollTop, left: scrollLeft });
  // Only a visible grid can be measured; while the view is hidden the flag
  // stays armed for the render that actually shows it.
  if (calendarNeedsAutoScroll && calendarMode !== "month" && els.calendarView.clientHeight) {
    calendarNeedsAutoScroll = false;
    scrollCalendarToFocus();
  }
}

/* First look at the grid goes to the lived part of the day: the now line when
   today is on screen, otherwise the day's first timed event, otherwise 8 AM.
   Runs once per opening of the calendar view (and on "jump to today"), never
   on the re-renders that follow every edit -- those restore the scroll the
   user had. Without this the grid opened parked at midnight, which on a phone
   meant a screen of empty small hours and no visible schedule. */
function scrollCalendarToFocus() {
  const body = els.calendarView.querySelector(".calendar-grid-body");
  if (!body) return;
  const dates = [...body.querySelectorAll(".calendar-grid-day")].map((column) => column.dataset.date);
  const today = todayISO();
  let minutes;
  if (dates.includes(today)) {
    const now = new Date();
    minutes = now.getHours() * 60 + now.getMinutes();
  } else {
    const focusDate = dates.includes(calendarCursorDate) ? calendarCursorDate : dates[0];
    const starts = visibleCalendarEventsForDay(focusDate || today)
      .filter((event) => !event.allDay && event.kind !== "deadline" && !event.supersededAt)
      .map((event) => calendarEventStartMinutes(event));
    minutes = starts.length ? Math.min(...starts) : 8 * 60;
  }
  const totalMinutes = (CALENDAR_DAY_END_HOUR - CALENDAR_DAY_START_HOUR) * 60;
  const bodyRect = body.getBoundingClientRect();
  const viewRect = els.calendarView.getBoundingClientRect();
  const bodyTop = bodyRect.top - viewRect.top + els.calendarView.scrollTop;
  const focusY = bodyTop + ((minutes - CALENDAR_DAY_START_HOUR * 60) / totalMinutes) * bodyRect.height;
  // A third of the way down, so the hour before is context and the hours ahead
  // get the room.
  els.calendarView.scrollTop = Math.max(0, focusY - els.calendarView.clientHeight * 0.33);
}

function calendarToolbar() {
  const toolbar = document.createElement("div");
  toolbar.className = "calendar-toolbar";

  const left = document.createElement("div");
  left.className = "calendar-toolbar-group";
  const prev = iconTextButton("\u2190", "Previous");
  const today = document.createElement("button");
  today.type = "button";
  today.className = "icon-button quiet calendar-today-button";
  today.title = "Jump to today";
  today.setAttribute("aria-label", "Jump to today");
  today.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.2M12 19.3v2.2M4.28 4.28l1.56 1.56M18.16 18.16l1.56 1.56M2.5 12h2.2M19.3 12h2.2M4.28 19.72l1.56-1.56M18.16 5.84l1.56-1.56" />
    </svg>
  `;
  const next = iconTextButton("\u2192", "Next");
  prev.addEventListener("click", () => shiftCalendarRange(-1));
  today.addEventListener("click", () => {
    calendarCursorDate = todayISO();
    state.currentDate = todayISO();
    calendarNeedsAutoScroll = true;
    saveLocal();
    render();
  });
  next.addEventListener("click", () => shiftCalendarRange(1));
  left.append(prev, today, next);

  const title = document.createElement("h3");
  title.textContent = calendarRangeTitle();

  const right = document.createElement("div");
  right.className = "calendar-toolbar-group";
  const kindGroup = document.createElement("div");
  kindGroup.className = "segmented-control calendar-kind-control";
  for (const kind of CALENDAR_KIND_FILTERS) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = kind[0].toUpperCase() + kind.slice(1);
    button.className = calendarKindFilter === kind ? "active" : "";
    button.addEventListener("click", () => {
      calendarKindFilter = kind;
      scheduleSettingsSave();
      renderCalendarView();
      renderSidePanel();
    });
    kindGroup.append(button);
  }
  // Shows/hides FYI (tentative) plan events -- office hours and the like.
  // Pressed = shown; a busy week can put them away without deleting anything.
  const fyiToggle = document.createElement("button");
  fyiToggle.type = "button";
  fyiToggle.className = calendarShowTentative ? "quiet active" : "quiet";
  fyiToggle.textContent = "FYI";
  fyiToggle.title = calendarShowTentative ? "Hide FYI / optional events" : "Show FYI / optional events";
  fyiToggle.setAttribute("aria-pressed", String(calendarShowTentative));
  fyiToggle.addEventListener("click", () => {
    calendarShowTentative = !calendarShowTentative;
    scheduleSettingsSave();
    renderCalendarView();
    renderSidePanel();
  });
  const modeGroup = document.createElement("div");
  modeGroup.className = "segmented-control";
  for (const mode of CALENDAR_VIEW_MODES) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = CALENDAR_VIEW_MODE_LABELS[mode];
    const modeName = mode[0].toUpperCase() + mode.slice(1);
    button.title = `${modeName} view`;
    button.setAttribute("aria-label", `${modeName} view`);
    button.className = calendarMode === mode ? "active" : "";
    button.addEventListener("click", () => {
      calendarMode = mode;
      scheduleSettingsSave();
      renderCalendarView();
    });
    modeGroup.append(button);
  }
  const add = document.createElement("button");
  add.type = "button";
  add.textContent = "Add";
  add.addEventListener("click", () => openCalendarEditor(calendarCursorDate));
  // Day view only: when reality has broken the plan, archive what is left of it
  // into a rail on the left and draft afresh. See archiveCurrentDayPlan.
  const replan = calendarMode === "day" && calendarKindFilter !== "actual" ? document.createElement("button") : null;
  if (replan) {
    replan.type = "button";
    replan.className = "quiet";
    replan.textContent = "Re-plan";
    replan.title = "Archive this day's remaining plan blocks as an old plan and start fresh";
    replan.addEventListener("click", () => archiveCurrentDayPlan(calendarCursorDate || todayISO()));
  }
  // Setting calendar connections up now lives in Settings; the calendar keeps
  // only the one-click refresh, and only once a connection actually exists. The
  // one button syncs every connected provider so there is nothing to choose.
  const anyCalendarConnected = googleCalendarStatus?.connected || outlookCalendarStatus?.connected;
  const anyCalendarSyncing = googleCalendarSyncing || outlookCalendarSyncing;
  const sync = anyCalendarConnected ? document.createElement("button") : null;
  if (sync) {
    sync.type = "button";
    sync.className = `icon-button quiet calendar-sync-button${anyCalendarSyncing ? " is-syncing" : ""}`;
    sync.disabled = anyCalendarSyncing;
    sync.title = anyCalendarSyncing ? "Syncing calendars..." : "Refresh synced calendar events";
    sync.setAttribute("aria-label", sync.title);
    sync.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M20 11a8 8 0 0 0-13.7-5.3L3 9M4 13a8 8 0 0 0 13.7 5.3L21 15" />
        <path d="M3 4v5h5M21 20v-5h-5" />
      </svg>
    `;
    sync.addEventListener("click", () => {
      if (googleCalendarStatus?.connected) syncGoogleCalendar();
      if (outlookCalendarStatus?.connected) syncOutlookCalendar();
    });
  }
  const desktopNotify = document.createElement("button");
  desktopNotify.type = "button";
  desktopNotify.className = desktopNotificationButtonClass();
  desktopNotify.textContent = "Hourly alerts";
  desktopNotify.title = desktopNotificationButtonTitle();
  desktopNotify.setAttribute("aria-pressed", String(desktopCalendarNotifications));
  desktopNotify.classList.toggle("is-blocked", desktopCalendarNotifications && notificationPermission() !== "granted");
  desktopNotify.addEventListener("click", toggleDesktopCalendarNotifications);
  const fullscreen = document.createElement("button");
  fullscreen.type = "button";
  fullscreen.className = "icon-button quiet";
  fullscreen.title = "Full screen calendar";
  fullscreen.setAttribute("aria-label", "Full screen calendar");
  fullscreen.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />
    </svg>
  `;
  fullscreen.addEventListener("click", toggleCalendarFullscreen);
  // Month view has no hour rows to stretch, so the zoom control only shows up
  // for the day and week grids.
  const zoomGroup = calendarMode === "month" ? null : calendarZoomControl();
  right.append(kindGroup, fyiToggle, modeGroup, ...(zoomGroup ? [zoomGroup] : []), ...(replan ? [replan] : []), add, ...(sync ? [sync] : []), desktopNotify, fullscreen);

  toolbar.append(left, title, right);
  return toolbar;
}

function googleCalendarPanel(options = {}) {
  const standalone = Boolean(options.standalone);
  const panel = document.createElement("section");
  panel.className = `google-calendar-panel${standalone ? " settings-google-panel" : ""}`;
  const status = googleCalendarStatus || {};

  const head = document.createElement("div");
  head.className = "google-calendar-panel-head";
  const title = document.createElement("h4");
  title.textContent = standalone ? "Connection details" : "Google Calendar";
  const badge = document.createElement("span");
  badge.className = status.connected ? "is-connected" : status.configured ? "is-configured" : "";
  badge.textContent = status.connected ? "Connected" : status.configured ? "Ready to connect" : "Not configured";
  head.append(title, badge);

  const form = document.createElement("form");
  form.className = "google-calendar-form";
  form.append(
    googleCalendarInput("Client ID", "clientId", "", "text", status.clientId || ""),
    googleCalendarInput("Client secret", "clientSecret", "", "password", status.configured ? "Saved" : ""),
    googleCalendarInput("Calendar ID", "calendarId", status.calendarId || "primary", "text"),
    googleCalendarInput("Past days", "lookbackDays", String(status.lookbackDays ?? 30), "number"),
    googleCalendarInput("Future days", "lookaheadDays", String(status.lookaheadDays ?? 180), "number")
  );
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await saveGoogleCalendarConfig(form);
      renderCalendarConnectionsSurface();
    } catch (error) {
      if (els.saveStatus) els.saveStatus.textContent = error.message || "Could not save Google Calendar settings";
    }
  });

  const redirect = document.createElement("p");
  redirect.className = "google-calendar-redirect";
  redirect.textContent = `Redirect URI: ${status.redirectUri || ""}`;

  const actions = document.createElement("div");
  actions.className = "google-calendar-actions";
  const save = document.createElement("button");
  save.type = "submit";
  save.textContent = "Save settings";
  form.append(save);
  const connect = document.createElement("button");
  connect.type = "button";
  connect.textContent = status.connected ? "Reconnect" : "Connect";
  connect.addEventListener("click", () => connectGoogleCalendar(form));
  const sync = document.createElement("button");
  sync.type = "button";
  sync.className = "quiet";
  sync.textContent = googleCalendarSyncing ? "Syncing..." : "Sync now";
  sync.disabled = !status.connected || googleCalendarSyncing;
  sync.addEventListener("click", syncGoogleCalendar);
  const disconnect = document.createElement("button");
  disconnect.type = "button";
  disconnect.className = "quiet danger";
  disconnect.textContent = "Disconnect";
  disconnect.disabled = !status.connected;
  disconnect.addEventListener("click", disconnectGoogleCalendar);
  actions.append(connect, sync, disconnect);

  const meta = document.createElement("p");
  meta.className = "google-calendar-meta";
  if (status.lastSyncAt) {
    meta.textContent = `Last sync: ${new Date(status.lastSyncAt).toLocaleString()} (${status.lastSyncCount ?? 0} events)`;
  } else {
    meta.textContent = "Sync imports Google events into this app as read-only calendar blocks.";
  }

  panel.append(head, form, redirect, actions, meta);
  return panel;
}

function googleCalendarInput(labelText, name, value, type = "text", placeholder = "") {
  const label = document.createElement("label");
  label.textContent = labelText;
  const input = document.createElement("input");
  input.type = type;
  input.name = name;
  input.value = value || "";
  input.placeholder = placeholder;
  if (type === "number") input.min = "0";
  label.append(input);
  return label;
}

// Deliberately reuses the google-calendar-* classes: the two connection panels
// should look identical, and the styles carry nothing Google-specific.
function outlookCalendarPanel(options = {}) {
  const standalone = Boolean(options.standalone);
  const panel = document.createElement("section");
  panel.className = `google-calendar-panel${standalone ? " settings-google-panel" : ""}`;
  const status = outlookCalendarStatus || {};

  const head = document.createElement("div");
  head.className = "google-calendar-panel-head";
  const title = document.createElement("h4");
  title.textContent = standalone ? "Connection details" : "Outlook Calendar";
  const badge = document.createElement("span");
  badge.className = status.connected ? "is-connected" : status.configured ? "is-configured" : "";
  badge.textContent = status.connected ? "Connected" : status.configured ? "Ready to connect" : "Not configured";
  head.append(title, badge);

  const form = document.createElement("form");
  form.className = "google-calendar-form";
  form.append(
    googleCalendarInput("Client ID", "clientId", "", "text", status.clientId || ""),
    googleCalendarInput("Client secret", "clientSecret", "", "password", status.configured ? "Saved" : ""),
    googleCalendarInput("Tenant", "tenant", status.tenant || "common", "text"),
    googleCalendarInput("Calendar ID", "calendarId", status.calendarId || "primary", "text"),
    googleCalendarInput("Past days", "lookbackDays", String(status.lookbackDays ?? 30), "number"),
    googleCalendarInput("Future days", "lookaheadDays", String(status.lookaheadDays ?? 180), "number")
  );
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await saveOutlookCalendarConfig(form);
      renderCalendarConnectionsSurface();
    } catch (error) {
      if (els.saveStatus) els.saveStatus.textContent = error.message || "Could not save Outlook Calendar settings";
    }
  });

  const redirect = document.createElement("p");
  redirect.className = "google-calendar-redirect";
  redirect.textContent = `Redirect URI: ${status.redirectUri || ""}`;

  const actions = document.createElement("div");
  actions.className = "google-calendar-actions";
  const save = document.createElement("button");
  save.type = "submit";
  save.textContent = "Save settings";
  form.append(save);
  const connect = document.createElement("button");
  connect.type = "button";
  connect.textContent = status.connected ? "Reconnect" : "Connect";
  connect.addEventListener("click", () => connectOutlookCalendar(form));
  const sync = document.createElement("button");
  sync.type = "button";
  sync.className = "quiet";
  sync.textContent = outlookCalendarSyncing ? "Syncing..." : "Sync now";
  sync.disabled = !status.connected || outlookCalendarSyncing;
  sync.addEventListener("click", syncOutlookCalendar);
  const disconnect = document.createElement("button");
  disconnect.type = "button";
  disconnect.className = "quiet danger";
  disconnect.textContent = "Disconnect";
  disconnect.disabled = !status.connected;
  disconnect.addEventListener("click", disconnectOutlookCalendar);
  actions.append(connect, sync, disconnect);

  const meta = document.createElement("p");
  meta.className = "google-calendar-meta";
  if (status.lastSyncAt) {
    meta.textContent = `Last sync: ${new Date(status.lastSyncAt).toLocaleString()} (${status.lastSyncCount ?? 0} events)`;
  } else {
    meta.textContent = "Sync imports Outlook events into this app as read-only calendar blocks.";
  }

  panel.append(head, form, redirect, actions, meta);
  return panel;
}

// Same classes as the calendar panels on purpose; see outlookCalendarPanel().
function spotifyPanel() {
  const panel = document.createElement("section");
  panel.className = "google-calendar-panel settings-google-panel spotify-panel";
  const status = spotifyStatus || {};
  const connected = status.connected && !status.needsReconnect;

  const head = document.createElement("div");
  head.className = "google-calendar-panel-head";
  const title = document.createElement("h4");
  title.textContent = "Connection details";
  const badge = document.createElement("span");
  badge.className = connected ? "is-connected" : status.configured ? "is-configured" : "";
  badge.textContent = connected
    ? "Connected"
    : status.needsReconnect ? "Needs reconnect" : status.configured ? "Ready to connect" : "Not configured";
  head.append(title, badge);

  const form = document.createElement("form");
  form.className = "google-calendar-form";
  form.append(
    googleCalendarInput("Client ID", "clientId", "", "text", status.clientId || ""),
    googleCalendarInput("Client secret", "clientSecret", "", "password", status.configured ? "Saved" : "")
  );
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await saveSpotifyConfig(form);
      renderSettingsView();
    } catch (error) {
      if (els.saveStatus) els.saveStatus.textContent = error.message || "Could not save Spotify settings";
    }
  });
  const save = document.createElement("button");
  save.type = "submit";
  save.textContent = "Save settings";
  form.append(save);

  const redirect = document.createElement("p");
  redirect.className = "google-calendar-redirect";
  redirect.textContent = `Redirect URI: ${status.redirectUri || ""}`;

  const actions = document.createElement("div");
  actions.className = "google-calendar-actions";
  const connect = document.createElement("button");
  connect.type = "button";
  connect.textContent = status.connected ? "Reconnect" : "Connect";
  connect.addEventListener("click", () => connectSpotify(form));
  const sync = document.createElement("button");
  sync.type = "button";
  sync.className = "quiet";
  sync.textContent = spotifySyncing ? "Fetching..." : "Fetch now";
  sync.disabled = !connected || spotifySyncing;
  sync.addEventListener("click", syncSpotify);
  const disconnect = document.createElement("button");
  disconnect.type = "button";
  disconnect.className = "quiet danger";
  disconnect.textContent = "Disconnect";
  disconnect.disabled = !status.connected;
  disconnect.addEventListener("click", disconnectSpotify);
  actions.append(connect, sync, disconnect);

  const meta = document.createElement("p");
  meta.className = "google-calendar-meta";
  if (status.lastSyncAt) {
    const parts = [`Last fetch: ${new Date(status.lastSyncAt).toLocaleString()} (${status.lastSyncCount ?? 0} new, ${status.totalListens ?? 0} logged)`];
    if (status.nowPlaying?.track) {
      parts.push(`${status.nowPlaying.isPlaying ? "Now playing" : "Paused"}: ${status.nowPlaying.track} - ${(status.nowPlaying.artists || []).join(", ")}`);
    }
    meta.textContent = parts.join(" | ");
  } else {
    meta.textContent = "Once connected, plays are logged automatically; nothing has been fetched yet.";
  }

  panel.append(head, form, redirect, actions, meta);

  const recent = Array.isArray(status.recent) ? status.recent : [];
  if (recent.length) {
    const list = document.createElement("ul");
    list.className = "spotify-recent";
    for (const row of recent) {
      const item = document.createElement("li");
      const when = document.createElement("span");
      when.className = "spotify-recent-when";
      when.textContent = new Date(row.playedAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
      const what = document.createElement("span");
      what.className = "spotify-recent-what";
      what.textContent = `${row.track} - ${(row.artists || []).join(", ")}`;
      item.append(when, what);
      list.append(item);
    }
    panel.append(list);
  }
  return panel;
}

function iconTextButton(text, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "icon-button quiet";
  button.setAttribute("aria-label", label);
  button.title = label;
  button.textContent = text;
  return button;
}

function shiftCalendarRange(direction) {
  const amount = calendarMode === "month" ? 30 : calendarMode === "week" ? 7 : 1;
  calendarCursorDate = shiftISODate(calendarCursorDate, direction * amount);
  state.currentDate = calendarCursorDate;
  ensureEntry(state.currentDate);
  saveLocal();
  render();
}

function toggleCalendarFullscreen() {
  els.calendarView.classList.toggle("is-fullscreen");
  document.body.classList.toggle("calendar-fullscreen-active", els.calendarView.classList.contains("is-fullscreen"));
}

// ---- calendar zoom ----
// `--calendar-zoom` multiplies the hour-row height (and the month cell height)
// and nothing else: text, the toolbar, the day headers and the column widths
// keep their size, so zooming in on the calendar never resizes anything around
// it. All calendar pointer math is derived from getBoundingClientRect() and
// percentages of the day column, so drag/resize/create stay accurate.

function normalizeCalendarZoom(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return CALENDAR_ZOOM_DEFAULT;
  return CALENDAR_ZOOM_LEVELS.reduce(
    (best, level) => (Math.abs(level - numeric) < Math.abs(best - numeric) ? level : best),
    CALENDAR_ZOOM_LEVELS[0]
  );
}

function calendarZoomIndex() {
  const index = CALENDAR_ZOOM_LEVELS.indexOf(calendarZoom);
  return index === -1 ? CALENDAR_ZOOM_LEVELS.indexOf(CALENDAR_ZOOM_DEFAULT) : index;
}

function applyCalendarZoom() {
  if (!els.calendarView) return;
  els.calendarView.style.setProperty("--calendar-zoom", String(calendarZoom));
  const label = els.calendarView.querySelector(".calendar-zoom-value");
  if (label) label.textContent = `${Math.round(calendarZoom * 100)}%`;
  const index = calendarZoomIndex();
  const out = els.calendarView.querySelector(".calendar-zoom-out");
  const zoomIn = els.calendarView.querySelector(".calendar-zoom-in");
  if (out) out.disabled = index === 0;
  if (zoomIn) zoomIn.disabled = index === CALENDAR_ZOOM_LEVELS.length - 1;
}

// anchorClientY keeps the hour under the pointer roughly in place instead of
// letting the day jump while you scroll-zoom. Only the hour rows stretch, so
// the distance measured from the top of the rows is what has to be rescaled --
// the day headers above them keep their height.
function setCalendarZoom(value, { anchorClientY = null } = {}) {
  const next = normalizeCalendarZoom(value);
  if (next === calendarZoom) return;
  const view = els.calendarView;
  const rows = view?.querySelector(".calendar-grid-days");
  let offset = 0;
  if (view && rows && anchorClientY != null) offset = anchorClientY - rows.getBoundingClientRect().top;
  const previous = calendarZoom;
  calendarZoom = next;
  applyCalendarZoom();
  scheduleSettingsSave();
  fitCalendarEventText();
  if (offset > 0) view.scrollTop += offset * (next / previous) - offset;
}

function stepCalendarZoom(direction, options = {}) {
  const index = calendarZoomIndex() + (direction > 0 ? 1 : -1);
  if (index < 0 || index >= CALENDAR_ZOOM_LEVELS.length) return;
  setCalendarZoom(CALENDAR_ZOOM_LEVELS[index], options);
}

function calendarZoomButton(text, className, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = text;
  button.title = label;
  button.setAttribute("aria-label", label);
  return button;
}

function calendarZoomControl() {
  const group = document.createElement("div");
  group.className = "segmented-control calendar-zoom-control";
  const out = calendarZoomButton("−", "calendar-zoom-out", "Zoom calendar out (Ctrl + scroll)");
  const value = calendarZoomButton(`${Math.round(calendarZoom * 100)}%`, "calendar-zoom-value", "Reset calendar zoom to 100%");
  const zoomIn = calendarZoomButton("+", "calendar-zoom-in", "Zoom calendar in (Ctrl + scroll)");
  out.addEventListener("click", () => stepCalendarZoom(-1));
  value.addEventListener("click", () => setCalendarZoom(CALENDAR_ZOOM_DEFAULT));
  zoomIn.addEventListener("click", () => stepCalendarZoom(1));
  group.append(out, value, zoomIn);
  return group;
}

// Ctrl + wheel over the calendar zooms the calendar instead of the whole app.
function handleCalendarWheelZoom(event) {
  if (!event.ctrlKey || event.deltaY === 0) return;
  if (!event.target?.closest?.(".calendar-time-grid")) return;
  event.preventDefault();
  stepCalendarZoom(event.deltaY < 0 ? 1 : -1, { anchorClientY: event.clientY });
}

function openCalendarEditor(date, draft = null) {
  calendarDraftDate = date || calendarCursorDate || todayISO();
  calendarDraftEvent = draft;
  calendarPersistentDraftPreview = draft?.start && draft?.end ? { date: draft.start.slice(0, 10), start: draft.start, end: draft.end } : null;
  editingCalendarEventId = "new";
  editingCalendarOccurrenceDate = null;
  renderCalendarView();
  renderPersistentDraftPreview();
  placeCalendarEditor(draft);
}

function calendarEditor() {
  const event = editingCalendarEventId === "new"
    ? { ...defaultCalendarEvent(calendarDraftDate), ...(calendarDraftEvent || {}) }
    : state.calendarEvents.find((item) => item.id === editingCalendarEventId);
  const source = calendarEditorZoneView(calendarEditorSource(event) || defaultCalendarEvent(calendarCursorDate));
  const isSyncedEvent = isSyncedCalendarEvent(source);
  const form = document.createElement("form");
  form.className = "calendar-editor";

  const zoneControls = calendarZoneControls(source, form);
  const transit = transitLogControls(source, form);
  const timeSummary = document.createElement("div");
  timeSummary.className = "calendar-time-summary";
  // The globe rides on the summary line rather than in the time row: the row is
  // two narrow columns inside a three-column editor, and a third column there
  // squeezed the End field down to a few characters.
  const timeSummaryText = document.createElement("span");
  const summaryShiftZones = (form2) => {
    const data = form2 ? new FormData(form2) : null;
    if (data ? data.get("zoneShiftOn") !== "on" : !source.zoneShift) return null;
    return {
      from: String(data?.get("tz") || data?.get("zoneShiftFrom") || source.zone || source.zoneShift?.from || ""),
      to: String(data?.get("zoneShiftTo") || source.zoneShift?.to || "")
    };
  };
  timeSummaryText.textContent = calendarEditorTimeSummary(
    source.start.slice(0, 10),
    source.start.slice(11, 16),
    source.end.slice(11, 16),
    source.end.slice(0, 10),
    summaryShiftZones(null)
  );
  timeSummary.append(timeSummaryText, zoneControls.toggle);
  const title = textField("Title", "text", source.title, "title");
  const date = textField("Date", "date", source.start.slice(0, 10), "date");
  // A second date only when the event already spans days, so the everyday
  // single-day editor keeps its familiar one-date layout. Multi-day events are
  // made by dragging across day columns, then adjusted here.
  // "Spans days" means more than the plain overnight rollover (23:50-01:10),
  // which the time fields already express on their own.
  const editorSpanDays = calendarDateToDayIndex(source.end.slice(0, 10)) - calendarDateToDayIndex(source.start.slice(0, 10));
  const spansDays = !source.allDay && (editorSpanDays > 1 || (editorSpanDays === 1 && source.end.slice(11, 16) >= source.start.slice(11, 16)));
  const endDateField = spansDays ? textField("End date", "date", source.end.slice(0, 10), "endDate") : null;
  const dateFields = document.createElement("div");
  dateFields.className = "calendar-time-fields";
  dateFields.append(date);
  if (endDateField) dateFields.append(endDateField);
  const kind = calendarKindField(source.kind || "plan");
  // FYI/tentative: an event worth knowing about without being committed to --
  // office hours, drop-in sessions. Ghosted on the grid and kept out of the
  // planned-hours numbers, so entering one costs nothing.
  const tentativeField = checkboxField("FYI / optional — not a commitment", source.tentative, "tentative");
  tentativeField.classList.add("calendar-tentative-field");
  // On a deadline the Start time is the due moment, so the End field gives way
  // to the question that actually needs answering: how long will the work take?
  // That number sizes the plan block placed from the deadline.
  const estimateField = textField("Expected work (minutes)", "number", source.estimateMinutes ? String(source.estimateMinutes) : "", "estimateMinutes");
  estimateField.classList.add("calendar-estimate-field");
  const estimateInput = estimateField.querySelector("input");
  if (estimateInput) {
    estimateInput.min = "0";
    estimateInput.step = "5";
    estimateInput.placeholder = "e.g. 120";
  }
  const deadlineStatus = calendarDeadlineStatus(source);
  const allDay = checkboxField("All day", source.allDay, "allDay");
  const start = textField("Start", "time", source.start.slice(11, 16), "start");
  const end = textField("End", "time", source.end.slice(11, 16), "end");
  const timeFields = document.createElement("div");
  timeFields.className = "calendar-time-fields";
  timeFields.append(start, end);
  const recurrence = recurrenceField(source.recurrence || "none", source.repeatDays || [], source.start.slice(0, 10));
  const link = textField("Link", "url", source.link, "link");
  const location = textField("Location", "text", source.location, "location");
  const category = categoryField(source.category || "");
  // Only local plan blocks can be pegged: nothing here can drag a provider
  // event, and the sync merge would drop the link on the next import.
  const taskPeg = isSyncedEvent ? null : calendarTaskPegField(source);
  const notes = textareaField("Notes", source.notes, "notes");
  if (isSyncedEvent) {
    [title, date, endDateField, start, end, link, location, notes].filter(Boolean).forEach(setCalendarFieldReadOnly);
  }

  const actions = document.createElement("div");
  actions.className = "calendar-editor-actions";
  const save = document.createElement("button");
  save.type = "submit";
  save.textContent = "Save";
  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "quiet";
  cancel.textContent = "Cancel";
  cancel.addEventListener("click", () => {
    editingCalendarEventId = null;
    editingCalendarOccurrenceDate = null;
    calendarDraftEvent = null;
    calendarPersistentDraftPreview = null;
    renderCalendarView();
  });
  actions.append(save, cancel);
  if (editingCalendarEventId !== "new") {
    if (source.kind === "plan") {
      const didIt = document.createElement("button");
      didIt.type = "button";
      didIt.className = "calendar-did-it-button";
      didIt.textContent = "I did it";
      didIt.addEventListener("click", () => copyCalendarPlanToActual(source));
      actions.append(didIt);
    }
    // An archived block offers the way back into the current plan. "I did it"
    // stays too: doing what the old plan said is real data.
    if (source.kind === "plan" && source.supersededAt) {
      const restore = document.createElement("button");
      restore.type = "button";
      restore.className = "quiet";
      restore.textContent = "Restore to current plan";
      restore.addEventListener("click", () => restoreCalendarPlanEvent(editingCalendarEventId));
      actions.append(restore);
    }
    if (!isSyncedEvent && !source.allDay && source.kind !== "deadline") actions.append(calendarSplitControl(form, source));
    const isRecurring = source.recurrence && source.recurrence !== "none";
    if (isSyncedEvent) {
      const sourceNote = document.createElement("span");
      sourceNote.className = "calendar-source-note";
      sourceNote.textContent = source.source === "outlook" ? "Imported from Outlook" : "Imported from Google";
      actions.append(sourceNote);
    } else if (isRecurring) {
      const removeOccurrence = document.createElement("button");
      removeOccurrence.type = "button";
      removeOccurrence.className = "quiet danger";
      removeOccurrence.textContent = "Delete this event";
      removeOccurrence.addEventListener("click", () => deleteCalendarEvent(editingCalendarEventId, { occurrenceOnly: true }));
      const removeSeries = document.createElement("button");
      removeSeries.type = "button";
      removeSeries.className = "quiet danger";
      removeSeries.textContent = "Delete recurring event";
      removeSeries.addEventListener("click", () => deleteCalendarEvent(editingCalendarEventId));
      actions.append(removeOccurrence, removeSeries);
    } else {
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "quiet danger";
      remove.textContent = "Delete";
      remove.addEventListener("click", () => deleteCalendarEvent(editingCalendarEventId));
      actions.append(remove);
    }
  }

  const body = document.createElement("div");
  body.className = "calendar-editor-body";
  // Order is layout: the kind row and the FYI row span the whole editor, and
  // the start/end pair takes two columns, so they are appended where those
  // spans fall on tidy rows rather than leaving holes.
  body.append(title, dateFields, kind, timeFields, allDay, tentativeField, estimateField, deadlineStatus, transit, zoneControls.panel, recurrence, link, location, category, notes);
  if (taskPeg) body.insertBefore(taskPeg, recurrence);
  form.append(timeSummary, body, actions);
  const syncWorkSession = () => {
    const selected = form.querySelector('input[name="category"]:checked')?.value || "";
  };
  // The form reshapes around the kind: a deadline has a due moment and an
  // estimate instead of an end time, and only a plan can be tentative.
  const syncKindFields = () => {
    const selectedKind = form.querySelector('input[name="kind"]:checked')?.value || "plan";
    end.classList.toggle("hidden", selectedKind === "deadline");
    tentativeField.classList.toggle("hidden", selectedKind !== "plan");
    estimateField.classList.toggle("hidden", selectedKind !== "deadline");
    deadlineStatus.classList.toggle("hidden", selectedKind !== "deadline" || !deadlineStatus.childNodes.length);
    // A peg only means anything on a plan block, so the row goes away with the
    // kind. The select keeps its value while hidden, so switching back to plan
    // does not cost the link.
    taskPeg?.classList.toggle("hidden", selectedKind !== "plan");
  };
  form.addEventListener("input", (eventInput) => {
    const data = new FormData(form);
    timeSummaryText.textContent = calendarEditorTimeSummary(data.get("date"), data.get("start"), data.get("end"), data.get("endDate"), summaryShiftZones(form));
    syncWorkSession();
    syncKindFields();
    zoneControls.panel.updateHint();
    // Rebuilding while typing inside a transit row would pull the input out
    // from under the cursor; every other field can reshape the rows.
    if (eventInput.target?.name !== "transitHour") transit.rebuild();
  });
  syncWorkSession();
  syncKindFields();
  form.addEventListener("submit", (eventSubmit) => {
    eventSubmit.preventDefault();
    saveCalendarEventFromForm(form, source);
  });
  return form;
}

// A recurring event is edited through the occurrence that was clicked, so the
// form shows that day's dates rather than the series anchor; the scope chooser
// on save decides how far the change reaches.
function calendarEditorSource(event) {
  if (!event) return null;
  if (!event.recurrence || event.recurrence === "none" || !editingCalendarOccurrenceDate) return event;
  const startTime = event.start.slice(11, 16);
  const endTime = event.end.slice(11, 16);
  const endDate = endTime < startTime ? shiftISODate(editingCalendarOccurrenceDate, 1) : editingCalendarOccurrenceDate;
  return { ...event, start: `${editingCalendarOccurrenceDate}T${startTime}`, end: `${endDate}T${endTime}` };
}

function setCalendarFieldReadOnly(field) {
  const control = field.querySelector?.("input, textarea");
  if (!control) return;
  control.readOnly = true;
  control.classList.add("is-readonly");
}

function placeCalendarEditor(draft = null) {
  requestAnimationFrame(() => {
    const editor = els.calendarView.querySelector(".calendar-editor");
    if (!editor) return;
    const calendarRect = els.calendarView.getBoundingClientRect();
    const gridRect = els.calendarView.querySelector(".calendar-time-grid, .calendar-month")?.getBoundingClientRect() || calendarRect;
    const editorWidth = Math.min(520, Math.max(360, window.innerWidth - 32));
    let left = Math.min(window.innerWidth - editorWidth - 16, gridRect.right + 16);
    if (draft?.start) {
      const date = draft.start.slice(0, 10);
      const hour = Number(draft.start.slice(11, 13));
      const slot = els.calendarView.querySelector(`.calendar-slot[data-date="${date}"][data-hour="${hour}"]`);
      if (slot) {
        const slotRect = slot.getBoundingClientRect();
        left = slotRect.right + 16;
        if (left + editorWidth > window.innerWidth - 16) {
          left = Math.max(gridRect.right - editorWidth - 18, window.innerWidth - editorWidth - 16);
        }
      }
    }
    left = Math.max(16, Math.min(left, window.innerWidth - editorWidth - 16));
    const top = Math.max(58, Math.min(gridRect.top + 10, window.innerHeight - 220));
    editor.style.left = `${left}px`;
    editor.style.top = `${top}px`;
    editor.style.width = `${editorWidth}px`;
    editor.style.maxHeight = `${Math.max(360, window.innerHeight - top - 16)}px`;
  });
}

function handleCalendarEditorOutsidePointer(event) {
  if (editingCalendarEventId !== "new") return;
  const editor = els.calendarView?.querySelector(".calendar-editor");
  if (!editor || editor.contains(event.target)) return;
  if (event.target.closest?.(".calendar-draft-preview")) return;
  closeCalendarDraftEditor(editor);
}

function closeCalendarDraftEditor(form) {
  if (calendarDraftHasUserContent(form)) {
    if (!String(new FormData(form).get("title") || "").trim()) {
      const titleInput = form.elements.title;
      if (titleInput) titleInput.value = "Untitled";
    }
    saveCalendarEventFromForm(form, formCalendarSource(form));
    return;
  }
  editingCalendarEventId = null;
  editingCalendarOccurrenceDate = null;
  calendarDraftEvent = null;
  calendarPersistentDraftPreview = null;
  renderCalendarView();
}

function calendarDraftHasUserContent(form) {
  const data = new FormData(form);
  return Boolean(
    String(data.get("title") || "").trim()
      || String(data.get("location") || "").trim()
      || String(data.get("link") || "").trim()
      || String(data.get("notes") || "").trim()
      || String(data.get("category") || "").trim()
  );
}

function formCalendarSource(form) {
  const data = new FormData(form);
  const date = String(data.get("date") || calendarDraftDate || calendarCursorDate);
  const startTime = String(data.get("start") || "09:00");
  const endTime = String(data.get("end") || "10:00");
  const formEndDate = String(data.get("endDate") || "");
  const endDate = /^\d{4}-\d{2}-\d{2}$/.test(formEndDate) && formEndDate > date
    ? formEndDate
    : endTime < startTime ? shiftISODate(date, 1) : date;
  return normalizeCalendarEvent({
    ...(calendarDraftEvent || defaultCalendarEvent(date)),
    title: String(data.get("title") || "").trim() || "Untitled",
    start: `${date}T${startTime}`,
    end: `${endDate}T${endTime}`
  }) || defaultCalendarEvent(date);
}

function textField(labelText, type, value, name) {
  const label = document.createElement("label");
  label.textContent = labelText;
  const input = document.createElement("input");
  input.type = type;
  input.name = name;
  input.value = value || "";
  label.append(input);
  return label;
}

function calendarEditorTimeSummary(date, start, end, endDate = "", shiftZones = null) {
  const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(String(date || "")) ? date : calendarCursorDate;
  const day = dateFromISO(safeDate).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const startTime = start || "09:00";
  const endTime = end || "10:00";
  const safeEndDate = /^\d{4}-\d{2}-\d{2}$/.test(String(endDate || "")) && endDate > safeDate ? endDate : "";
  if (safeEndDate) {
    const endDay = dateFromISO(safeEndDate).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
    return `${day} ${formatClockFromTime(startTime)} - ${endDay} ${formatClockFromTime(endTime)}`;
  }
  // On a move the two clocks belong to two zones, so "later or earlier" is a
  // question about instants -- the date line can put an earlier-reading arrival
  // clock on the same day.
  const crossZone =
    shiftZones && isValidTimeZone(shiftZones.from) && isValidTimeZone(shiftZones.to) && shiftZones.from !== shiftZones.to
      ? zoneWallClockToInstant(`${safeDate}T${endTime}`, shiftZones.to) < zoneWallClockToInstant(`${safeDate}T${startTime}`, shiftZones.from)
      : null;
  const nextDay = (crossZone === null ? endTime < startTime : crossZone) ? " (next day)" : "";
  return `${day} ${formatClockFromTime(startTime)} - ${formatClockFromTime(endTime)}${nextDay}`;
}

/* --- The time zone panel -----------------------------------------------------

   Moving country is a twice-a-year event and pegging a block to a foreign clock
   is barely more common, so neither gets a permanent seat in the editor. Both
   live behind one small globe at the end of the time row, and the globe only
   lights up once an event actually uses them. An event that has one already
   opens with the panel down, so the setting is never invisible on the block
   that carries it.

   The panel edits a pegged event in *its own* zone -- see calendarEditorZoneView
   -- which is what makes the round trip stable. Show a Taipei 09:00 as the
   Bangkok 08:00 it is stored as, and the next save would read that 08:00 back as
   a Taipei 08:00 and quietly walk the meeting an hour earlier every time it was
   opened. */

const ZONE_SELECT_FLOATING_LABEL = "Floating — stays at this clock anywhere";

/* Zones the user has starred. The full IANA list is over four hundred entries
   and nobody lives in four hundred places, so the list that matters is short and
   hand-picked. Everything else stays reachable by search. */
let favoriteTimeZones = [];

// Order is the user's, so this keeps it rather than sorting: a starred list is
// short enough to arrange by hand and the first entry is usually home.
function normalizeFavoriteTimeZones(input) {
  const zones = [];
  for (const zone of Array.isArray(input) ? input : []) {
    const name = String(zone || "").trim();
    if (isValidTimeZone(name) && !zones.includes(name)) zones.push(name);
  }
  return zones;
}

// The zones this person demonstrably uses: the starred ones first, then the ones
// the data itself proves -- where the machine is, where the log says they have
// been, what events are pegged to. Derived, so it is never empty and never stale.
function knownZoneNames() {
  const zones = [];
  const push = (zone) => {
    if (isValidTimeZone(zone) && !zones.includes(zone)) zones.push(zone);
  };
  for (const zone of favoriteTimeZones) push(zone);
  push(currentTimeZone());
  for (const row of zoneTransitions) {
    push(row.to);
    push(row.from);
  }
  for (const event of state.calendarEvents || []) push(event.tz);
  return zones;
}

function allTimeZoneNames() {
  return typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
}

function toggleFavoriteTimeZone(zone) {
  if (!isValidTimeZone(zone)) return false;
  favoriteTimeZones = favoriteTimeZones.includes(zone)
    ? favoriteTimeZones.filter((item) => item !== zone)
    : [...favoriteTimeZones, zone];
  scheduleSettingsSave();
  saveLocal();
  return true;
}

/* Ordered by offset, west to east, because that is the axis a person actually
   thinks along -- "somewhere around GMT+7" -- and IANA's alphabetical order puts
   Adak next to Anchorage next to Anguilla, which tells you nothing.

   The offset is read at today's instant, so a zone on summer time sorts where it
   currently sits rather than where it sits in January. That is the right answer
   for a picker: it should match the clock the user can see right now. */
function zonesByOffset(zones) {
  const now = Date.now();
  const groups = new Map();
  for (const zone of zones) {
    const offset = zoneOffsetMinutes(zone, now);
    if (!groups.has(offset)) groups.set(offset, []);
    groups.get(offset).push(zone);
  }
  return [...groups.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([offset, list]) => ({
      offset,
      label: zoneOffsetLabel(offset),
      zones: list.sort((a, b) => zoneCityLabel(a).localeCompare(zoneCityLabel(b)))
    }));
}

function zoneOptionLabel(zone) {
  return `${zoneCityLabel(zone)} — ${zone}`;
}

function zoneMatchesSearch(zone, query) {
  if (!query) return true;
  const haystack = `${zone} ${zoneCityLabel(zone)} ${zoneOffsetLabel(zoneOffsetMinutes(zone, Date.now()))}`.toLowerCase();
  // Every word has to appear somewhere, so "asia 7" and "bang" both work.
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

/* A select plus a search box plus a star, wired together.

   The select keeps the name, so FormData still reads this exactly as it read a
   plain dropdown and nothing downstream had to learn about any of it. The search
   box is deliberately unnamed for the same reason. */
function zoneSelect(name, value, options = {}) {
  const wrap = document.createElement("div");
  wrap.className = "zone-select";
  const search = document.createElement("input");
  search.type = "search";
  search.className = "zone-select-search";
  search.placeholder = "Search zones or GMT offset";
  search.setAttribute("aria-label", "Search time zones");
  const select = document.createElement("select");
  select.name = name;
  select.className = "zone-select-list";

  const star = document.createElement("button");
  star.type = "button";
  star.className = "zone-select-star";

  const fill = (query) => {
    const chosen = select.value || value || "";
    select.replaceChildren();
    if (options.floating) {
      const blank = document.createElement("option");
      blank.value = "";
      blank.textContent = ZONE_SELECT_FLOATING_LABEL;
      select.append(blank);
    }
    const addGroup = (label, zones) => {
      const matching = zones.filter((zone) => zoneMatchesSearch(zone, query));
      if (!matching.length) return;
      const group = document.createElement("optgroup");
      group.label = label;
      for (const zone of matching) {
        const option = document.createElement("option");
        option.value = zone;
        option.textContent = zoneOptionLabel(zone);
        group.append(option);
      }
      select.append(group);
    };
    const known = knownZoneNames();
    addGroup("My time zones", known);
    const rest = allTimeZoneNames().filter((zone) => !known.includes(zone));
    for (const group of zonesByOffset(rest)) addGroup(group.label, group.zones);
    // A zone that is stored on an event but no longer in the IANA list still has
    // to be selectable, or opening that event would silently re-peg it.
    if (chosen && !known.includes(chosen) && !rest.includes(chosen)) addGroup("Stored", [chosen]);
    select.value = chosen;
    // Everything was filtered away from under the selection: keep the value on
    // the element so a save cannot blank it, and say so rather than showing an
    // empty box.
    if (select.value !== chosen && chosen) {
      const orphan = document.createElement("option");
      orphan.value = chosen;
      orphan.textContent = `${zoneOptionLabel(chosen)} (not in this search)`;
      select.prepend(orphan);
      select.value = chosen;
    }
    syncStar();
  };

  function syncStar() {
    const zone = select.value;
    const starred = Boolean(zone) && favoriteTimeZones.includes(zone);
    star.textContent = starred ? "★" : "☆";
    star.disabled = !zone;
    star.classList.toggle("is-on", starred);
    star.title = !zone
      ? "Pick a zone to add it to your list"
      : starred
        ? `Remove ${zoneCityLabel(zone)} from your time zones`
        : `Add ${zoneCityLabel(zone)} to your time zones`;
    star.setAttribute("aria-label", star.title);
  }

  search.addEventListener("input", () => fill(search.value.trim()));
  // A search box inside a form would otherwise submit it on Enter, which in the
  // event editor means saving the event mid-search.
  search.addEventListener("keydown", (event) => {
    if (event.key === "Enter") event.preventDefault();
  });
  select.addEventListener("change", syncStar);
  star.addEventListener("click", () => {
    if (!toggleFavoriteTimeZone(select.value)) return;
    fill(search.value.trim());
    // The starred list is the top group of every other picker on screen too.
    if (activeView === "settings") renderSettingsView();
  });

  fill("");
  const row = document.createElement("div");
  row.className = "zone-select-row";
  row.append(select, star);
  wrap.append(search, row);
  // Callers read `.value` off the control they were handed, and some of them
  // hold on to it (the shift row reads from.value / to.value directly).
  Object.defineProperty(wrap, "value", {
    get: () => select.value,
    set: (next) => {
      select.value = next;
      syncStar();
    }
  });
  return wrap;
}

function labelledControl(labelText, control) {
  const label = document.createElement("label");
  label.textContent = labelText;
  label.append(control);
  return label;
}

function calendarZoneControls(source, form) {
  const date = source.start.slice(0, 10);
  const livedZone = source.zone || zoneForDate(date);
  const active = Boolean(source.tz || source.zoneShift);

  const panel = document.createElement("fieldset");
  panel.className = "calendar-zone-field";
  panel.classList.toggle("hidden", !active);
  const legend = document.createElement("legend");
  legend.textContent = "Time zone";
  const peg = labelledControl("This event's clock is", zoneSelect("tz", source.tz || "", { floating: true }));
  peg.className = "calendar-zone-peg";

  const shiftOn = checkboxField("I changed time zone during this", Boolean(source.zoneShift), "zoneShiftOn");
  shiftOn.classList.add("calendar-zone-shift-toggle");
  const shiftRow = document.createElement("div");
  shiftRow.className = "calendar-zone-shift-row";
  shiftRow.classList.toggle("hidden", !source.zoneShift);
  const from = zoneSelect("zoneShiftFrom", source.zoneShift?.from || livedZone);
  const to = zoneSelect("zoneShiftTo", source.zoneShift?.to || (currentTimeZone() !== livedZone ? currentTimeZone() : ""));
  const whenValue = source.zoneShift?.when || "end";
  const isClock = /^\d{2}:\d{2}$/.test(whenValue);
  const when = document.createElement("select");
  when.name = "zoneShiftWhen";
  for (const option of [
    { value: "end", label: "when it ended" },
    { value: "start", label: "when it started" },
    { value: "clock", label: "at a set time" }
  ]) {
    const item = document.createElement("option");
    item.value = option.value;
    item.textContent = option.label;
    item.selected = isClock ? option.value === "clock" : option.value === whenValue;
    when.append(item);
  }
  const at = document.createElement("input");
  at.type = "time";
  at.name = "zoneShiftAt";
  at.value = isClock ? whenValue : source.start.slice(11, 16);
  const atField = labelledControl("Clock", at);
  atField.classList.toggle("hidden", !isClock);
  shiftRow.append(labelledControl("From", from), labelledControl("To", to), labelledControl("Changed", when), atField);

  const hint = document.createElement("p");
  hint.className = "calendar-zone-hint";
  panel.append(legend, peg, shiftOn, shiftRow, hint);

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "calendar-zone-toggle";
  toggle.textContent = "🌐";
  toggle.title = "Time zone — peg this event to a zone, or record a move";
  toggle.setAttribute("aria-label", "Time zone");
  toggle.classList.toggle("is-on", active);
  toggle.addEventListener("click", () => {
    panel.classList.toggle("hidden");
    if (!panel.classList.contains("hidden")) panel.querySelector("select")?.focus();
  });

  panel.updateHint = () => {
    // At creation the form exists but has no fields yet, and an empty FormData
    // would read as "shift off" -- fall back to the source until it is real.
    const data = form?.elements?.namedItem?.("start") ? new FormData(form) : null;
    const typedDate = String(data?.get("date") || date);
    const typedStart = String(data?.get("start") || source.start.slice(11, 16));
    const pegZone = String(data?.get("tz") || "");
    const shiftEnabled = data ? data.get("zoneShiftOn") === "on" : Boolean(source.zoneShift);
    shiftRow.classList.toggle("hidden", !shiftEnabled);
    atField.classList.toggle("hidden", when.value !== "clock");
    toggle.classList.toggle("is-on", Boolean(pegZone) || shiftEnabled);
    const lines = [];
    if (pegZone) {
      const here = zoneForDate(typedDate);
      const local = convertZoneWallClock(`${typedDate}T${typedStart}`, pegZone, here);
      lines.push(
        here === pegZone
          ? `Pegged to ${zoneCityLabel(pegZone)}, which is the clock this day is already drawn in.`
          : `${typedStart} in ${zoneCityLabel(pegZone)} is ${local.slice(11, 16)} on ${zoneCityLabel(here)} time, where this day is drawn.`
      );
    }
    if (shiftEnabled && isValidTimeZone(from.value) && isValidTimeZone(to.value) && from.value !== to.value) {
      const startZone = pegZone || from.value;
      const instant = zoneWallClockToInstant(`${typedDate}T${typedStart}`, startZone);
      // The ticket line: what the two boxes mean, and the real length they add
      // up to -- the confirmation that 09:00-12:30 across a move is not 3h30.
      const typedEnd = String(data?.get("end") || source.end.slice(11, 16));
      const typedEndDate = String(data?.get("endDate") || "");
      const explicitEnd = /^\d{4}-\d{2}-\d{2}$/.test(typedEndDate) && typedEndDate > typedDate ? typedEndDate : "";
      const endWall = zoneShiftEndFromTicket(`${typedDate}T${typedStart}`, typedEnd, startZone, { to: to.value }, explicitEnd);
      const realMinutes = Math.round((zoneWallClockToInstant(endWall, startZone) - instant) / 60000);
      const length = Number.isFinite(realMinutes) && realMinutes > 0
        ? ` — ${Math.floor(realMinutes / 60)}h${realMinutes % 60 ? String(realMinutes % 60).padStart(2, "0") : ""} start to end`
        : "";
      lines.push(`Start reads ${zoneCityLabel(startZone)} time, End reads ${zoneCityLabel(to.value)} time${length}.`);
      const delta = zoneOffsetMinutes(to.value, instant) - zoneOffsetMinutes(from.value, instant);
      const hours = Math.abs(delta) / 60;
      const size = Number.isInteger(hours) ? `${hours}` : hours.toFixed(1);
      lines.push(
        delta === 0
          ? `${zoneCityLabel(from.value)} and ${zoneCityLabel(to.value)} keep the same clock, so nothing is gained or lost.`
          : delta < 0
            ? `Clocks go back ${size}h — you live ${size}h of this date twice, and it will count as a ${Math.round(24 + hours)}-hour day.`
            : `Clocks go forward ${size}h — ${size}h of this date never happens, and it will count as a ${Math.round(24 - hours)}-hour day.`
      );
    }
    hint.textContent = lines.join(" ");
    hint.classList.toggle("hidden", !lines.length);
  };
  panel.addEventListener("input", () => panel.updateHint());
  panel.updateHint();
  return { toggle, panel };
}

/* --- The transit sub-calendar ------------------------------------------------

   The answer to "where do I write what I did on the plane". A block that
   carries a move gets one obvious button; behind it, one text row per real
   hour of the block, labelled with both wall clocks at the top of the hour.
   Rows are elapsed hours, so there is nothing to convert and no divider to
   reason about -- hour 7 of the journey is hour 7 whatever any clock says.
   Stored on the event as `transitLog`, index = hours since the start. */
function transitLogControls(source, form) {
  const wrap = document.createElement("fieldset");
  wrap.className = "calendar-transit-field";
  const legend = document.createElement("legend");
  legend.textContent = "In transit";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "calendar-transit-button";
  const rows = document.createElement("div");
  rows.className = "calendar-transit-rows";
  // A log that already says something opens showing it.
  let open = (source.transitLog || []).some(Boolean);
  rows.classList.toggle("hidden", !open);
  wrap.append(legend, button, rows);

  const typedValues = () => [...rows.querySelectorAll('input[name="transitHour"]')].map((input) => input.value);

  wrap.rebuild = () => {
    // Same trick as the zone hint: at creation the form exists but has no
    // fields yet, and an empty FormData would read as "shift off".
    const data = form?.elements?.namedItem?.("start") ? new FormData(form) : null;
    const shiftEnabled = data ? data.get("zoneShiftOn") === "on" : Boolean(source.zoneShift);
    wrap.classList.toggle("hidden", !shiftEnabled);
    if (!shiftEnabled) return;
    const date = String(data?.get("date") || source.start.slice(0, 10));
    const startTime = String(data?.get("start") || source.start.slice(11, 16));
    const endTime = String(data?.get("end") || source.end.slice(11, 16));
    const from = String(data?.get("zoneShiftFrom") || source.zoneShift?.from || "");
    const to = String(data?.get("zoneShiftTo") || source.zoneShift?.to || "");
    const zone = String(data?.get("tz") || "") || from;
    const endDateRaw = String(data?.get("endDate") || "");
    const explicitEnd = /^\d{4}-\d{2}-\d{2}$/.test(endDateRaw) && endDateRaw > date ? endDateRaw : "";
    const startWall = `${date}T${startTime}`;
    const startInstant = zoneWallClockToInstant(startWall, zone);
    const endWall = zoneShiftEndFromTicket(startWall, endTime, zone, { to }, explicitEnd);
    const endInstant = zoneWallClockToInstant(endWall, zone);
    const hourRows = transitHourRows(startInstant, endInstant, from, to);
    const kept = typedValues();
    const saved = source.transitLog || [];
    rows.textContent = "";
    hourRows.forEach((hour, index) => {
      const row = document.createElement("label");
      row.className = "calendar-transit-row";
      const clocks = document.createElement("span");
      clocks.className = "calendar-transit-clocks";
      clocks.textContent = `${hour.fromClock} ${zoneCityLabel(from)} · ${hour.toClock} ${zoneCityLabel(to)}`;
      const input = document.createElement("input");
      input.type = "text";
      input.name = "transitHour";
      input.placeholder = `Hour ${index + 1}`;
      input.value = kept[index] ?? saved[index] ?? "";
      row.append(clocks, input);
      rows.append(row);
    });
    const minutes = Number.isFinite(startInstant) && Number.isFinite(endInstant) ? Math.max(0, Math.round((endInstant - startInstant) / 60000)) : 0;
    const length = `${Math.floor(minutes / 60)}h${minutes % 60 ? String(minutes % 60).padStart(2, "0") : ""}`;
    button.textContent = open ? "✈ Hide the transit log" : `✈ Log the ${length} in transit — hour by hour`;
  };

  button.addEventListener("click", () => {
    open = !open;
    rows.classList.toggle("hidden", !open);
    wrap.rebuild();
    if (open) rows.querySelector("input")?.focus();
  });
  wrap.rebuild();
  return wrap;
}

/* A pegged event is shown in the zone it is pegged to, not the zone it is
   stored in. Everything else in the editor -- the summary line, the split
   control, the form itself -- reads this copy, so the clock on screen and the
   zone in the dropdown always describe the same moment. */
function calendarEditorZoneView(event) {
  if (!event) return event;
  let view = event;
  if (event.tz && event.zone && event.zone !== event.tz) {
    view = {
      ...event,
      start: convertZoneWallClock(event.start, event.zone, event.tz),
      end: convertZoneWallClock(event.end, event.zone, event.tz),
      zone: event.tz
    };
  }
  /* A move's End is shown the way its ticket reads: in the destination's
     clock. The stored end lives in the start's zone, so the editor converts on
     the way in and calendarEventFromForm converts back on the way out. The
     view's `zone` stays the start's zone -- it describes the Start field. */
  if (view.zoneShift?.to && !view.allDay && isValidTimeZone(view.zoneShift.to) && view.zone !== view.zoneShift.to) {
    view = { ...view, end: convertZoneWallClock(view.end, view.zone, view.zoneShift.to) };
  }
  return view;
}

function calendarKindField(value) {
  const wrap = document.createElement("fieldset");
  wrap.className = "calendar-kind-field";
  const legend = document.createElement("legend");
  legend.textContent = "Plan, actual or deadline";
  wrap.append(legend);
  for (const kind of ["plan", "actual", "deadline"]) {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "kind";
    input.value = kind;
    input.checked = value === kind;
    const button = document.createElement("span");
    button.textContent = kind[0].toUpperCase() + kind.slice(1);
    label.append(input, button);
    wrap.append(label);
  }
  return wrap;
}

/* What the editor says about a deadline's work plan: which block is booked for
   it, or that none is yet, with the button that starts the placement gesture.
   Only for saved deadlines -- a new one has no id for a block to point at. */
function calendarDeadlineStatus(source) {
  const wrap = document.createElement("div");
  wrap.className = "calendar-deadline-plan-status hidden";
  if (editingCalendarEventId === "new" || source.kind !== "deadline") return wrap;
  const stored = state.calendarEvents.find((event) => event.id === source.id);
  if (!stored) return wrap;
  const text = document.createElement("span");
  const planned = deadlinePlanEvents(stored.id)[0] || null;
  if (planned) {
    const day = planned.start.slice(0, 10);
    text.textContent = `Work planned: ${formatShortDate(day)} ${formatClockFromTime(planned.start.slice(11, 16))}`;
  } else {
    text.textContent = "No work time booked yet";
  }
  const plan = document.createElement("button");
  plan.type = "button";
  plan.className = "quiet";
  plan.textContent = planned ? "Plan another block" : "Plan work time";
  plan.addEventListener("click", () => {
    editingCalendarEventId = null;
    editingCalendarOccurrenceDate = null;
    calendarDraftEvent = null;
    calendarPersistentDraftPreview = null;
    startDeadlinePlacement(stored);
  });
  wrap.append(text, plan);
  return wrap;
}

/* The "Pegged task" row: whose due date follows this block. This is the way to
   peg a block that was never placed from a task row -- one drawn straight on
   the grid, or one whose task was made afterwards. Plan blocks only: a deadline
   is itself the due moment, and an actual block is a record of what happened.
   Provider events are not offered either, because they cannot be dragged here
   and the next sync would drop the link anyway.

   The list also offers a task that does not exist yet, so a block drawn on the
   grid can become the schedule for a task in one pass instead of two: type the
   name here rather than leaving the calendar to add the row and coming back. */

/* What the select carries while it is asking for that new task. Deliberately
   not a task id -- nothing is written until Save. */
const NEW_PEG_TASK_VALUE = "__new__";

function calendarTaskPegField(source) {
  const wrap = document.createElement("label");
  wrap.className = "calendar-task-peg-field";
  wrap.textContent = "Pegged task";
  const select = document.createElement("select");
  select.name = "taskId";
  const none = document.createElement("option");
  none.value = "";
  none.textContent = "— none —";
  select.append(none);
  // Directly under "none", because a block drawn straight on the grid more
  // often has no task yet than one waiting further down the list.
  const make = document.createElement("option");
  make.value = NEW_PEG_TASK_VALUE;
  make.textContent = "+ New task from this block…";
  select.append(make);
  const current = String(source.taskId || "").trim();
  let matched = false;
  for (const option of peggableTaskOptions()) {
    const item = document.createElement("option");
    item.value = option.id;
    item.textContent = option.label;
    if (option.id === current) matched = true;
    select.append(item);
  }
  // A peg whose task has since been ticked off or deleted keeps its place in
  // the list instead of quietly reading "none": a save would otherwise cut a
  // link nobody asked to cut, and the row is the only record that it existed.
  if (current && !matched) {
    const gone = document.createElement("option");
    gone.value = current;
    gone.textContent = "(task no longer open)";
    select.append(gone);
  }
  select.value = current;
  // Only shown once the row is asking for a new task. Nothing is created here:
  // the task is written on Save, so a peg started and then cancelled leaves no
  // orphan task behind.
  const newText = document.createElement("input");
  newText.type = "text";
  newText.name = "newTaskText";
  newText.className = "calendar-task-peg-new";
  newText.placeholder = "What is the task?";
  const hint = document.createElement("span");
  hint.className = "calendar-task-peg-hint";
  wrap.append(select, newText, hint);
  const syncNewTask = () => {
    const making = select.value === NEW_PEG_TASK_VALUE;
    newText.classList.toggle("hidden", !making);
    hint.textContent = making
      ? "Created when you save: due this block's day, sized to its length, and it follows the block from then on."
      : "Move this block to another day and the task's due date moves with it.";
  };
  select.addEventListener("change", () => {
    // Seeded from the title as typed rather than the stored one: the usual
    // reason to peg a hand-drawn block is that its title is the task.
    if (select.value === NEW_PEG_TASK_VALUE && !newText.value.trim()) {
      newText.value = String(wrap.closest("form")?.querySelector('[name="title"]')?.value || source.title || "").trim();
    }
    syncNewTask();
    if (select.value !== NEW_PEG_TASK_VALUE) return;
    newText.focus();
    newText.select();
  });
  syncNewTask();
  return wrap;
}

function recurrenceField(value, repeatDays = [], startDate = calendarCursorDate) {
  const label = document.createElement("fieldset");
  label.className = "calendar-recurrence-field";
  const legend = document.createElement("legend");
  legend.textContent = "Repeats";
  label.append(legend);
  const select = document.createElement("select");
  select.name = "recurrence";
  for (const option of CALENDAR_RECURRENCE_OPTIONS) {
    const item = document.createElement("option");
    item.value = option.value;
    item.textContent = option.label;
    select.append(item);
  }
  select.value = value || "none";
  label.append(select);
  const days = document.createElement("div");
  days.className = "calendar-repeat-days";
  const selectedDays = repeatDays.length ? repeatDays : [dateFromISO(startDate).getDay()];
  for (const day of CALENDAR_WEEKDAYS) {
    const dayLabel = document.createElement("label");
    dayLabel.title = `Repeat on ${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day.value]}`;
    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "repeatDays";
    input.value = String(day.value);
    input.checked = selectedDays.includes(day.value);
    const box = document.createElement("span");
    box.textContent = day.label;
    dayLabel.append(input, box);
    days.append(dayLabel);
  }
  label.append(days);
  const renderRepeatDays = () => {
    days.classList.toggle("hidden", select.value !== "weekly");
  };
  select.addEventListener("change", renderRepeatDays);
  renderRepeatDays();
  return label;
}

function textareaField(labelText, value, name) {
  const label = document.createElement("label");
  label.className = "calendar-notes-field";
  label.textContent = labelText;
  const textarea = document.createElement("textarea");
  textarea.name = name;
  textarea.value = value || "";
  label.append(textarea);
  return label;
}

function checkboxField(labelText, checked, name) {
  const label = document.createElement("label");
  label.className = "checkbox-row";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.name = name;
  input.checked = checked;
  label.append(input, document.createTextNode(labelText));
  return label;
}

function categoryField(value) {
  const wrap = document.createElement("fieldset");
  wrap.className = "calendar-category-field";
  const legend = document.createElement("legend");
  legend.textContent = "Category";
  wrap.append(legend);
  const groups = [
    { label: "Social", codes: ["G", "F", "D", "N"], color: "#a855f7" },
    { label: "Productive", codes: ["W", "B", "S", "C", "Q"], color: "#22d3ee" },
    { label: "Health", codes: ["Z", "H", "E"], color: "#4ade80" },
    { label: "Misc", codes: ["X", "R", "T", "A", "V"], color: "#f59e0b" }
  ];
  for (const group of groups) {
    const groupRow = document.createElement("div");
    groupRow.className = "calendar-category-group";
    groupRow.style.setProperty("--group-color", group.color);
    const groupLabel = document.createElement("span");
    groupLabel.className = "calendar-category-group-label";
    groupLabel.textContent = group.label;
    const buttons = document.createElement("div");
    buttons.className = "calendar-category-buttons";
    for (const code of group.codes) {
      const category = CALENDAR_CATEGORIES.find((item) => item.code === code);
      if (!category) continue;
      buttons.append(categoryButton(category, value));
    }
    groupRow.append(groupLabel, buttons);
    wrap.append(groupRow);
  }
  return wrap;
}

function categoryButton(category, value) {
    const label = document.createElement("label");
    label.title = category.label;
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "category";
    input.value = category.code;
    input.checked = category.code === value;
    const swatch = document.createElement("span");
    swatch.style.background = category.color;
    if (["H", "Q"].includes(category.code)) swatch.style.color = "#111718";
    swatch.textContent = category.code;
    label.append(input, swatch);
    return label;
}

function saveCalendarEventFromForm(form, source, scope = null) {
  // Editing a repeating event needs a scope decision first: the stored record
  // is the whole series, so writing the form straight onto it would change
  // every occurrence, past ones included.
  const series = editingCalendarEventId !== "new" && !isSyncedCalendarEvent(source) && source.recurrence && source.recurrence !== "none"
    ? state.calendarEvents.find((event) => event.id === source.id)
    : null;
  const pending = Boolean(series) && !scope;
  // The event is still built before the question is asked, because that is what
  // says whether the form is savable at all -- but a build that is about to be
  // thrown away must not create a "+ New task" peg, or cancelling the chooser
  // would leave a task behind for an event that was never saved.
  const saved = calendarEventFromForm(form, source, { createPegTask: !pending });
  if (!saved) return;
  if (pending) {
    showRecurringScopeChooser(form, source);
    return;
  }
  if (series && scope === "occurrence") {
    if (!detachRecurringOccurrence(series, editingCalendarOccurrenceDate || source.start.slice(0, 10), saved)) return;
  } else if (series && scope === "following") {
    if (!splitRecurringSeriesAt(series, editingCalendarOccurrenceDate || source.start.slice(0, 10), saved)) return;
  } else {
    const index = state.calendarEvents.findIndex((event) => event.id === saved.id);
    if (index === -1) state.calendarEvents.push(saved);
    else state.calendarEvents[index] = saved;
  }
  closeCalendarEditorAfterChange(saved.start.slice(0, 10), saved);
}

function calendarEventFromForm(form, source, options = {}) {
  const data = new FormData(form);
  const providerControlled = isSyncedCalendarEvent(source);
  const title = providerControlled ? source.title : String(data.get("title") || "").trim();
  const date = String(data.get("date") || calendarCursorDate);
  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
  const allDay = providerControlled ? source.allDay : data.get("allDay") === "on";
  const startTime = allDay ? "00:00" : String(data.get("start") || "09:00");
  const endTime = allDay ? "23:59" : String(data.get("end") || startTime || "10:00");
  // An explicit end date (multi-day event) wins; otherwise an end clock earlier
  // than the start means the event runs past midnight, so it ends on the next
  // day: 23:50 - 01:10 is 80 minutes, not backwards.
  const formEndDate = String(data.get("endDate") || "");
  const endDate = /^\d{4}-\d{2}-\d{2}$/.test(formEndDate) && formEndDate > date
    ? formEndDate
    : !allDay && endTime < startTime ? shiftISODate(date, 1) : date;
  const category = String(data.get("category") || "");
  const repeatDays = data.get("recurrence") === "weekly"
    ? data.getAll("repeatDays").map(Number).filter((day) => day >= 0 && day <= 6)
    : [];
  /* The clock in the form belongs to whichever zone the panel says it does: the
     peg if there is one (choose Taipei and the 09:00 you typed is a Taipei
     09:00, the way every calendar app behaves), the departure zone if this block
     is a move, and otherwise the zone this day is already being drawn in. */
  const tz = providerControlled ? source.tz || "" : String(data.get("tz") || "");
  const shiftWhenChoice = String(data.get("zoneShiftWhen") || "end");
  const zoneShift =
    data.get("zoneShiftOn") === "on"
      ? {
          from: String(data.get("zoneShiftFrom") || ""),
          to: String(data.get("zoneShiftTo") || ""),
          when: shiftWhenChoice === "clock" ? String(data.get("zoneShiftAt") || "") : shiftWhenChoice
        }
      : null;
  const normalizedShift = normalizeEventZoneShift(zoneShift);
  const zone = tz || normalizedShift?.from || source.zone || zoneForDate(date);
  /* On a move the End box reads like the ticket -- the destination's clock --
     so it is rewritten here into the zone the start is written in, which is the
     only zone the stored pair is allowed to live in. */
  const explicitEndDate = /^\d{4}-\d{2}-\d{2}$/.test(formEndDate) && formEndDate > date ? formEndDate : "";
  const localEnd = normalizedShift && !allDay
    ? zoneShiftEndFromTicket(`${date}T${startTime}`, endTime, zone, normalizedShift, explicitEndDate)
    : `${endDate}T${endTime}`;
  const now = new Date().toISOString();
  // Only trust the form's transit rows when it rendered any; a form with no
  // rows (no shift ever shown) must not wipe a log the event already has.
  const transitRows = data.getAll("transitHour").map((value) => String(value || ""));
  return normalizeCalendarEvent({
    ...source,
    tz,
    zone,
    zoneShift: normalizedShift,
    transitLog: transitRows.length ? transitRows : source.transitLog || [],
    id: editingCalendarEventId === "new" ? calendarEventId() : source.id,
    title,
    start: providerControlled ? source.start : `${date}T${startTime}`,
    end: providerControlled ? source.end : localEnd,
    allDay,
    kind: ["actual", "deadline"].includes(data.get("kind")) ? data.get("kind") : "plan",
    // Read unconditionally; the normaliser drops tentative on anything that is
    // not a plan, so a hidden checkbox cannot smuggle the flag onto a deadline.
    tentative: data.get("tentative") === "on",
    estimateMinutes: normalizeEstimateMinutes(data.get("estimateMinutes")),
    // Read only when the editor rendered the row; a form without it (a
    // provider event) must not wipe a peg the block already carries. Reading it
    // is also what creates the task when the row asks for a new one, which is
    // why it goes through taskPegIdFromForm rather than the FormData.
    taskId: form.querySelector('[name="taskId"]')
      ? taskPegIdFromForm(form, {
          date,
          category,
          estimateMinutes: calendarBlockMinutes(date, startTime, endDate, endTime, allDay),
          createTask: options.createPegTask !== false
        })
      : String(source.taskId || "").trim(),
    category,
    location: providerControlled ? source.location : data.get("location"),
    link: providerControlled ? source.link : data.get("link"),
    notes: providerControlled ? source.notes : data.get("notes"),
    recurrence: providerControlled ? source.recurrence : data.get("recurrence") || "none",
    repeatDays: providerControlled ? source.repeatDays : repeatDays,
    recurrenceEndDate: providerControlled || data.get("recurrence") === source.recurrence ? source.recurrenceEndDate || "" : "",
    exceptionDates: source.exceptionDates || [],
    color: categoryColor(category) || source.color || CALENDAR_COLORS[0],
    updatedAt: now,
    createdAt: source.createdAt || now
  });
}

function closeCalendarEditorAfterChange(date, saved = null) {
  state.calendarEvents = normalizeCalendarEvents(state.calendarEvents);
  calendarCursorDate = date;
  state.currentDate = date;
  editingCalendarEventId = null;
  editingCalendarOccurrenceDate = null;
  calendarDraftEvent = null;
  calendarPersistentDraftPreview = null;
  saveCalendarEvents();
  /* A block that carries a move writes the transition log too, and the stored
     event has to be the one that does it -- the form copy is in the peg zone,
     while the log wants the moment, which only the normalised event knows. The
     re-render afterwards is what redraws the day at its new length. */
  if (saved) followPeggedTaskDueDate(saved.id);
  if (saved) {
    syncZoneTransitionForEvent(state.calendarEvents.find((event) => event.id === saved.id) || saved).then((changed) => {
      if (!changed) return;
      ensureZoneDividersForDate(saved.start.slice(0, 10));
      render();
    });
  }
  render();
}

// Detach one day from a repeating series: that date becomes an exception and a
// standalone event, with any overrides applied, takes its place.
function detachRecurringOccurrence(series, occurrenceDate, overrides = {}) {
  const now = new Date().toISOString();
  const detached = normalizeCalendarEvent({
    ...series,
    ...overrides,
    id: calendarEventId(),
    recurrence: "none",
    repeatDays: [],
    recurrenceEndDate: "",
    exceptionDates: [],
    // A new local id is a new block, so it cannot inherit the Google event the
    // block it was spread from owns -- two blocks pointing at one Google event
    // would overwrite each other on every sync.
    googleEventId: "",
    createdAt: now,
    updatedAt: now
  });
  if (!detached) return null;
  series.exceptionDates = [...new Set([...(series.exceptionDates || []), occurrenceDate])].sort();
  series.updatedAt = now;
  state.calendarEvents.push(detached);
  return detached;
}

// End a series at occurrenceDate and start a new one there with the overrides
// applied. Editing from the first occurrence just rewrites the series, since
// "this and following" is then the whole thing.
function splitRecurringSeriesAt(series, occurrenceDate, overrides = {}) {
  const now = new Date().toISOString();
  if (occurrenceDate <= series.start.slice(0, 10)) {
    const updated = normalizeCalendarEvent({ ...series, ...overrides, id: series.id, updatedAt: now });
    if (!updated) return null;
    const index = state.calendarEvents.findIndex((event) => event.id === series.id);
    if (index === -1) state.calendarEvents.push(updated);
    else state.calendarEvents[index] = updated;
    return updated;
  }
  const successor = normalizeCalendarEvent({
    ...series,
    ...overrides,
    id: calendarEventId(),
    exceptionDates: (series.exceptionDates || []).filter((date) => date >= occurrenceDate),
    createdAt: now,
    updatedAt: now
  });
  if (!successor) return null;
  // recurrenceEndDate is exclusive in recurringEventTouchesDate, so ending the
  // old series at the edited day keeps every earlier occurrence and hands this
  // day onward to the successor.
  series.recurrenceEndDate = occurrenceDate;
  series.exceptionDates = (series.exceptionDates || []).filter((date) => date < occurrenceDate);
  series.updatedAt = now;
  state.calendarEvents.push(successor);
  return successor;
}

function showRecurringScopeChooser(form, source) {
  if (form.querySelector(".calendar-scope-overlay")) return;
  const overlay = document.createElement("div");
  overlay.className = "calendar-scope-overlay";
  const card = document.createElement("div");
  card.className = "calendar-scope-card";
  const heading = document.createElement("strong");
  heading.textContent = "This is a repeating event";
  const pick = (label, scope) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", () => {
      overlay.remove();
      saveCalendarEventFromForm(form, source, scope);
    });
    return button;
  };
  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "quiet";
  cancel.textContent = "Cancel";
  cancel.addEventListener("click", () => overlay.remove());
  card.append(heading, pick("Save this event only", "occurrence"), pick("Save this and following events", "following"), cancel);
  overlay.append(card);
  form.append(overlay);
}

function calendarSplitControl(form, source) {
  const wrap = document.createElement("div");
  wrap.className = "calendar-split-row";
  const open = document.createElement("button");
  open.type = "button";
  open.className = "quiet";
  open.textContent = "Split";
  open.addEventListener("click", () => {
    wrap.textContent = "";
    const data = new FormData(form);
    const startTime = String(data.get("start") || "09:00");
    const endTime = String(data.get("end") || "10:00");
    const clockMinutes = (clock) => {
      const [hours, minutes] = clock.split(":").map(Number);
      return hours * 60 + minutes;
    };
    const startMinutes = clockMinutes(startTime);
    const endMinutes = clockMinutes(endTime) + (endTime < startTime ? 1440 : 0);
    const midpoint = startMinutes + Math.round((endMinutes - startMinutes) / 2 / CALENDAR_SNAP_MINUTES) * CALENDAR_SNAP_MINUTES;
    const time = document.createElement("input");
    time.type = "time";
    time.step = CALENDAR_SNAP_MINUTES * 60;
    time.value = `${String(Math.floor((midpoint % 1440) / 60)).padStart(2, "0")}:${String(midpoint % 60).padStart(2, "0")}`;
    time.addEventListener("input", () => time.classList.remove("is-invalid"));
    const confirmButton = document.createElement("button");
    confirmButton.type = "button";
    confirmButton.textContent = "Split here";
    confirmButton.addEventListener("click", () => {
      if (!splitCalendarEventAt(form, source, time.value)) time.classList.add("is-invalid");
    });
    const cancelSplit = document.createElement("button");
    cancelSplit.type = "button";
    cancelSplit.className = "quiet";
    cancelSplit.textContent = "Cancel";
    cancelSplit.addEventListener("click", () => {
      wrap.textContent = "";
      wrap.append(open);
    });
    wrap.append(time, confirmButton, cancelSplit);
  });
  wrap.append(open);
  return wrap;
}

// Cut one event into two back-to-back events at the given clock time. Both
// halves keep the form's current values; the second half opens for editing
// straight away, since the usual reason to split is to retitle or
// recategorise what happened after the cut.
function splitCalendarEventAt(form, source, splitTime) {
  if (!/^\d{2}:\d{2}$/.test(String(splitTime || ""))) return false;
  const saved = calendarEventFromForm(form, source);
  if (!saved || saved.allDay) return false;
  const date = saved.start.slice(0, 10);
  const startMinutes = calendarDateTimeToMinutes(saved.start);
  const endMinutes = calendarDateTimeToMinutes(saved.end) + (saved.end.slice(0, 10) !== date ? 1440 : 0);
  let splitMinutes = calendarDateTimeToMinutes(`${date}T${splitTime}`);
  // An overnight event may be cut after midnight: a split clock at or before
  // the start belongs to the next day.
  if (splitMinutes <= startMinutes && endMinutes > 1440) splitMinutes += 1440;
  if (splitMinutes <= startMinutes || splitMinutes >= endMinutes) return false;
  const splitStamp = `${splitMinutes >= 1440 ? shiftISODate(date, 1) : date}T${splitTime}`;
  const now = new Date().toISOString();
  const series = source.recurrence && source.recurrence !== "none"
    ? state.calendarEvents.find((event) => event.id === source.id)
    : null;
  let first;
  if (series) {
    // Splitting only makes sense for the day in view, so the occurrence
    // detaches from the series and both halves are standalone events.
    first = detachRecurringOccurrence(series, editingCalendarOccurrenceDate || date, { ...saved, end: splitStamp });
  } else {
    first = normalizeCalendarEvent({ ...saved, end: splitStamp });
    if (first) {
      const index = state.calendarEvents.findIndex((event) => event.id === first.id);
      if (index === -1) state.calendarEvents.push(first);
      else state.calendarEvents[index] = first;
    }
  }
  if (!first) return false;
  const second = normalizeCalendarEvent({
    ...saved,
    id: calendarEventId(),
    start: splitStamp,
    recurrence: "none",
    repeatDays: [],
    recurrenceEndDate: "",
    exceptionDates: [],
    // A new local id is a new block, so it cannot inherit the Google event the
    // block it was spread from owns -- two blocks pointing at one Google event
    // would overwrite each other on every sync.
    googleEventId: "",
    createdAt: now,
    updatedAt: now
  });
  if (second) state.calendarEvents.push(second);
  state.calendarEvents = normalizeCalendarEvents(state.calendarEvents);
  calendarCursorDate = date;
  state.currentDate = date;
  editingCalendarEventId = second ? second.id : null;
  editingCalendarOccurrenceDate = second ? date : null;
  calendarDraftEvent = null;
  calendarPersistentDraftPreview = null;
  saveCalendarEvents();
  render();
  return true;
}

function copyCalendarPlanToActual(source) {
  const occurrenceDate = editingCalendarOccurrenceDate || source.start.slice(0, 10);
  const startTime = source.start.slice(11, 16);
  const endTime = source.end.slice(11, 16);
  const endDate = endTime < startTime ? shiftISODate(occurrenceDate, 1) : occurrenceDate;
  // `source` is the editor's zone view, so on a move its end clock is the
  // destination's and has to be rewritten into the start's zone, same as a save.
  const end = source.zoneShift && !source.allDay
    ? zoneShiftEndFromTicket(`${occurrenceDate}T${startTime}`, endTime, source.zone || zoneForDate(occurrenceDate), source.zoneShift)
    : `${endDate}T${endTime}`;
  const now = new Date().toISOString();
  const actual = normalizeCalendarEvent({
    ...source,
    id: calendarEventId(),
    start: `${occurrenceDate}T${startTime}`,
    end,
    kind: "actual",
    recurrence: "none",
    repeatDays: [],
    recurrenceEndDate: "",
    exceptionDates: [],
    source: "local",
    calendarId: "local",
    providerId: null,
    // A new local id is a new block, so it cannot inherit the Google event the
    // block it was spread from owns -- two blocks pointing at one Google event
    // would overwrite each other on every sync.
    googleEventId: "",
    updatedAt: now,
    createdAt: now
  });
  if (!actual) return;
  state.calendarEvents.push(actual);
  state.calendarEvents = normalizeCalendarEvents(state.calendarEvents);
  calendarCursorDate = occurrenceDate;
  state.currentDate = occurrenceDate;
  calendarKindFilter = "both";
  editingCalendarEventId = null;
  editingCalendarOccurrenceDate = null;
  calendarDraftEvent = null;
  calendarPersistentDraftPreview = null;
  saveCalendarEvents();
  render();
}

/* Re-planning a day: the plan that reality broke is not deleted, it is
   archived. Every current plan block still to come on the day gets the same
   supersededAt stamp; one stamp = one old plan = one rail on the left of the
   day column. When the day is today only blocks that have not finished yet are
   taken -- a morning that already ran as planned is history, not something to
   re-plan -- so the day's effective plan reads as old morning + new afternoon.
   Recurring blocks (standing commitments), FYI blocks (never commitments) and
   imported blocks stay put. */
function archiveCurrentDayPlan(date) {
  const cutoff = date === todayISO() ? isoDateTimeFromDate(new Date()) : "";
  const candidates = (state.calendarEvents || []).filter((event) =>
    event.kind === "plan" &&
    !event.supersededAt &&
    !event.tentative &&
    !event.allDay &&
    (!event.recurrence || event.recurrence === "none") &&
    !isSyncedCalendarEvent(event) &&
    eventTouchesDate(event, date) &&
    (!cutoff || event.end > cutoff)
  );
  if (!candidates.length) {
    alert("Nothing to archive: no current plan blocks are left on this day. Recurring, FYI and imported blocks stay put.");
    return;
  }
  const scope = cutoff ? "still to come today" : "on this day";
  const message = `Archive ${candidates.length} plan block${candidates.length === 1 ? "" : "s"} ${scope} as an old plan?\n\nThey collapse to a strip on the left of the day and stop counting as the plan. Any of them can be restored later.`;
  if (!confirm(message)) return;
  const stamp = new Date().toISOString();
  for (const event of candidates) {
    event.supersededAt = stamp;
    event.updatedAt = stamp;
  }
  state.calendarEvents = normalizeCalendarEvents(state.calendarEvents);
  calendarExpandedOldPlanStamp = null;
  saveCalendarEvents();
  render();
}

// The way back: an archived block rejoins the current plan. Restoring is
// per-block, not per-rail -- half the point of re-planning is that only some
// of the old plan was wrong.
function restoreCalendarPlanEvent(eventId) {
  const source = state.calendarEvents.find((event) => event.id === eventId);
  if (!source) return;
  source.supersededAt = "";
  source.updatedAt = new Date().toISOString();
  state.calendarEvents = normalizeCalendarEvents(state.calendarEvents);
  editingCalendarEventId = null;
  editingCalendarOccurrenceDate = null;
  saveCalendarEvents();
  render();
}

function deleteCalendarEvent(eventId, options = {}) {
  const source = state.calendarEvents.find((event) => event.id === eventId);
  if (options.occurrenceOnly && source?.recurrence && source.recurrence !== "none") {
    const date = editingCalendarOccurrenceDate || calendarCursorDate || source.start.slice(0, 10);
    source.exceptionDates = [...new Set([...(source.exceptionDates || []), date])].sort();
    source.updatedAt = new Date().toISOString();
    state.calendarEvents = normalizeCalendarEvents(state.calendarEvents);
  } else if (source?.recurrence && source.recurrence !== "none") {
    const date = editingCalendarOccurrenceDate || calendarCursorDate || source.start.slice(0, 10);
    if (date <= source.start.slice(0, 10)) {
      state.calendarEvents = state.calendarEvents.filter((event) => event.id !== eventId);
    } else {
      source.recurrenceEndDate = date;
      source.exceptionDates = (source.exceptionDates || []).filter((exceptionDate) => exceptionDate < date);
      source.updatedAt = new Date().toISOString();
      state.calendarEvents = normalizeCalendarEvents(state.calendarEvents);
    }
  } else {
    state.calendarEvents = state.calendarEvents.filter((event) => event.id !== eventId);
  }
  editingCalendarEventId = null;
  editingCalendarOccurrenceDate = null;
  calendarDraftEvent = null;
  calendarPersistentDraftPreview = null;
  saveCalendarEvents();
  // Deleting the flight deletes the move it recorded. Leaving the row behind
  // would keep bending every total after it with nothing on screen to explain it.
  if (!state.calendarEvents.some((event) => event.id === eventId)) {
    removeZoneTransitionForEvent(eventId).then((changed) => {
      if (changed) render();
    });
  }
  render();
}

// ---------------------------------------------------------------------------
// Calendar ranges and the real-time duration of a block, which the week
// totals and the weekly digest are both built on.

function calendarRangeDates() {
  if (calendarMode === "day") return [calendarCursorDate];
  if (calendarMode === "week") {
    const start = startOfWeek(calendarCursorDate);
    return Array.from({ length: 7 }, (_, index) => shiftISODate(start, index));
  }
  const month = calendarCursorDate.slice(0, 7);
  const first = monthStart(calendarCursorDate);
  const dates = [];
  for (let index = 0; index < 31; index += 1) {
    const date = shiftISODate(first, index);
    if (!date.startsWith(month)) break;
    dates.push(date);
  }
  return dates;
}

/* How long a block on this date really ran.

   Subtracting two clocks is right on every ordinary day and wrong on the days
   this whole feature is about. Work 08:00 to 17:00 on a day when the clock went
   back an hour at 13:20 and the clocks say nine hours; you were at it for ten.
   Fly the other way and the clocks say nine when it was eight. Either way the
   total is simply wrong, and every hours figure in the app inherits it.

   Both clocks are placed on the day's segmented timeline and the difference is
   taken in real time. The end is looked for in the earliest segment at or after
   the one the start landed in, which is what tells a block that merely sits
   inside the repeated hour (12:30-13:00, half an hour) apart from one that runs
   through it (08:00-17:00, ten hours). Ordinary days short-circuit before any of
   this, so nothing pays for it. */
function realMinutesBetweenClocks(date, startMinutes, endMinutes) {
  const clockMinutes = Math.max(0, endMinutes - startMinutes);
  // The typeof guard keeps this usable from the test harnesses, which extract
  // this function without the timeline that sits half a file away.
  if (typeof dateZoneSegments !== "function") return clockMinutes;
  const segments = dateZoneSegments(date);
  if (segments.length < 2) return clockMinutes;
  const startIndex = segments.findIndex((segment) => segment.endMinutes > startMinutes);
  if (startIndex === -1) return clockMinutes;
  const from = segments[startIndex];
  const endIndex = segments.findIndex((segment, index) => index >= startIndex && segment.endMinutes >= endMinutes);
  const to = endIndex === -1 ? segments[segments.length - 1] : segments[endIndex];
  // A clock inside a gap never happened; the block is read as starting when time
  // resumed, which is the only instant it could have started at.
  const startInstant = from.startInstant + Math.max(0, startMinutes - from.startMinutes) * 60000;
  const endInstant = to.startInstant + Math.max(0, endMinutes - to.startMinutes) * 60000;
  return Math.max(0, Math.round((endInstant - startInstant) / 60000));
}

function formatWorkDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  if (!hours) return `${rest}m`;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

function startOfWorkWeek(dateString) {
  const date = dateFromISO(dateString);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return isoFromDate(date);
}

function workWeekDates(dateString) {
  const start = startOfWorkWeek(dateString);
  return Array.from({ length: 7 }, (_, index) => shiftISODate(start, index));
}

// "Aug 3-9", or "Aug 31 - Sep 6" when the range straddles a month.
function isoRangeText(start, end) {
  const month = (date) => dateFromISO(date).toLocaleDateString(undefined, { month: "short" });
  const day = (date) => String(Number(date.slice(8, 10)));
  return month(start) === month(end)
    ? `${month(start)} ${day(start)}-${day(end)}`
    : `${month(start)} ${day(start)} - ${month(end)} ${day(end)}`;
}

/* --- Unlogged and unplanned hours -------------------------------------------

   Two counters whose only job is to be zero, looking in opposite directions.
   Everything else in this footer answers "how much" -- these answer "how much
   is missing", which is the number that actually gets acted on, because a gap
   you can see is a gap you close.

   Unlogged looks back: hours since Monday, up to this minute, with no `actual`
   block over them -- the past is the only thing there is to log, and a counter
   that reported Saturday's hours as missing on a Wednesday would be noise from
   the moment the week began. Unplanned looks ahead: hours from this minute to
   the end of the week with no `plan` block over them -- a plan for an hour
   already lived through is not a plan, and counting it as a gap made the chip
   an unpayable debt by Tuesday instead of a to-do list. Category does not come
   into it either way. Sleep counts like anything else -- the question is
   whether the hour is accounted for, not whether it was productive.

   The week here runs Monday to Sunday, the same week as the grid and the pace
   bar (it was Sunday-based until Sep 2026). The chips still carry explicit
   bounds ("since Mon", "to Sun") rather than "this week", spelled from the
   week they measure; an unlabelled number next to a differently-bounded one
   is precisely the bug this footer used to have.
--------------------------------------------------------------------------- */

// An hour is logged when most of it is, not when all of it is. Blocks get
// rounded to five minutes and butted up against each other by hand, so a
// stricter rule would report gaps that are really just the seams between them.
const HOUR_COVERAGE_THRESHOLD = 0.6;

function startOfCoverageWeek(dateString) {
  const date = dateFromISO(dateString);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return isoFromDate(date);
}

// Union, not sum: two blocks over the same hour cover it once. Summing would
// let a double-booked morning pay for an empty afternoon.
function mergeCoverageSpans(spans) {
  const merged = [];
  for (const span of spans.slice().sort((a, b) => a[0] - b[0])) {
    const last = merged[merged.length - 1];
    if (last && span[0] <= last[1]) last[1] = Math.max(last[1], span[1]);
    else merged.push([span[0], span[1]]);
  }
  return merged;
}

function coverageSpans(dates, kind) {
  const spans = [];
  for (const date of dates) {
    const dayStart = calendarDateToDayIndex(date) * 1440;
    for (const event of eventsForDay(date)) {
      // All-day blocks label a day rather than accounting for its hours, so one
      // of them would otherwise mark a whole day logged without saying anything.
      if (event.kind !== kind || event.allDay) continue;
      const start = dayStart + event.displayStartMinutes;
      const end = dayStart + event.displayEndMinutes;
      if (end > start) spans.push([start, end]);
    }
  }
  return mergeCoverageSpans(spans);
}

function coveredMinutesWithin(spans, from, to) {
  let total = 0;
  for (const [start, end] of spans) total += Math.max(0, Math.min(end, to) - Math.max(start, from));
  return total;
}

// A partial hour at either edge of the window is judged on the minutes inside
// it, not on a full sixty. Half an hour, fully logged, is not a gap yet -- and
// the half-hour left of the hour in progress is not a planning gap either if a
// plan block sits over it.
function uncoveredHours(spans, from, to) {
  let uncovered = 0;
  for (let hour = Math.floor(from / 60) * 60; hour < to; hour += 60) {
    const start = Math.max(hour, from);
    const end = Math.min(hour + 60, to);
    const within = end - start;
    if (within <= 0) continue;
    if (coveredMinutesWithin(spans, start, end) < HOUR_COVERAGE_THRESHOLD * within) uncovered += 1;
  }
  return uncovered;
}

/* Answers for the day and week being *looked at*, not for today. Paging back to
   a past week and being told about this one would be a mistake, and a worse one
   here than in a summary: these counters are a to-do list, and a
   to-do list for a week you are not looking at is not actionable.

   "Up to now" survives the move as a clamp rather than an assumption -- and so
   does "from now on", its mirror. A week in the past has fully elapsed, is
   judged whole for unlogged, and has nothing left to plan; the week containing
   now splits at this minute; a week in the future has nothing elapsed to judge,
   returns `elapsed: false` so the unlogged chip stays out of the way rather
   than reporting a clean sheet nobody has earned yet, and is all remaining --
   paging forward to plan next week is exactly when the unplanned count is
   wanted. */
function coverageSummary(dateString, now = new Date()) {
  const weekStart = startOfCoverageWeek(dateString);
  const weekEnd = shiftISODate(weekStart, 6);
  const today = isoFromDate(now);
  const until = calendarDateToDayIndex(today) * 1440 + now.getHours() * 60 + now.getMinutes();
  const startOf = (date) => calendarDateToDayIndex(date) * 1440;
  const clamp = (from, to) => Math.max(from, Math.min(to, until));

  const weekFrom = startOf(weekStart);
  const weekUntilEnd = startOf(weekEnd) + 1440;
  const weekTo = clamp(weekFrom, weekUntilEnd);
  const dayFrom = startOf(dateString);
  const dayTo = clamp(dayFrom, dayFrom + 1440);
  // The unplanned window is the mirror image of the unlogged one: this minute
  // to Saturday midnight, clamped inside the week being looked at.
  const aheadFrom = Math.min(Math.max(weekFrom, until), weekUntilEnd);

  const elapsedDates = [];
  for (let date = weekStart; date <= weekEnd && date <= today; date = shiftISODate(date, 1)) elapsedDates.push(date);
  const weekDates = [];
  for (let date = weekStart; date <= weekEnd; date = shiftISODate(date, 1)) weekDates.push(date);
  const actual = coverageSpans(elapsedDates, "actual");
  const plan = coverageSpans(weekDates, "plan");
  return {
    weekStart,
    weekEnd,
    date: dateString,
    today,
    elapsed: weekTo > weekFrom,
    // The cursor can sit on a day that has not happened yet -- Wednesday of the
    // current week -- where "0h unlogged" would read as an achievement rather
    // than as a day nobody has lived through.
    dayElapsed: dayTo > dayFrom,
    // Whether the week holds this minute, which is what decides between the
    // "since Sun" / "to Sat" labels and a plain date range on the chips.
    running: weekStart <= today && today <= weekEnd,
    // Whether any of the week is still to come -- what the unplanned chip has
    // to say something about, the way `elapsed` gates the unlogged one.
    remaining: aheadFrom < weekUntilEnd,
    unlogged: { day: uncoveredHours(actual, dayFrom, dayTo), week: uncoveredHours(actual, weekFrom, weekTo) },
    unplanned: uncoveredHours(plan, aheadFrom, weekUntilEnd)
  };
}

// Reads "clear" at zero rather than "0h today · 0h since Sun". The point of the
// counter is the state it is meant to be driven to, and a row of zeroes states
// that far less plainly than the word does.
function buildCoverageChips(summary) {
  const wrap = document.createElement("span");
  wrap.className = "coverage-split";
  // A week that has neither started nor anything left -- impossible for a real
  // one, but the guard keeps the render honest -- has no gaps to report, and
  // saying "clear" about it would be claiming credit for hours nobody has
  // lived through yet.
  wrap.hidden = !summary.elapsed && !summary.remaining;
  if (wrap.hidden) return wrap;

  // Composed rather than asked of toLocaleDateString with both parts, which
  // orders them by locale and reads as "15 Sat" in plenty of them.
  const short = (date) => `${dateFromISO(date).toLocaleDateString(undefined, { weekday: "short" })} ${Number(date.slice(8, 10))}`;
  const weekday = (date) => dateFromISO(date).toLocaleDateString(undefined, { weekday: "short" });
  const threshold = `An hour counts as covered once ${HOUR_COVERAGE_THRESHOLD * 100}% of it is.`;

  const chip = (kind, clear, text, title) => {
    const el = document.createElement("span");
    el.className = `coverage-chip is-${kind}`;
    el.classList.toggle("is-clear", clear);
    el.textContent = text;
    el.title = title;
    wrap.append(el);
  };

  // Unlogged looks back, so it only exists once some of the week has.
  if (summary.elapsed) {
    const counts = summary.unlogged;
    const clear = !counts.week && (!summary.dayElapsed || !counts.day);
    const dayLabel = summary.date === summary.today ? "today" : short(summary.date);
    const weekLabel = summary.running ? `since ${weekday(summary.weekStart)}` : isoRangeText(summary.weekStart, summary.weekEnd);
    const window = summary.running ? `${summary.weekStart} to now` : `${summary.weekStart} to ${summary.weekEnd}`;
    const counted = summary.dayElapsed
      ? `${counts.day}h ${dayLabel} · ${counts.week}h ${weekLabel}`
      : `${counts.week}h ${weekLabel}`;
    const day = summary.dayElapsed ? `${counts.day} on ${summary.date}, ` : "";
    chip("unlogged", clear, clear ? "Unlogged clear" : `Unlogged ${counted}`, clear
      ? `Every hour from ${window} has an actual block over it. ${threshold}`
      : `Hours with no actual block over them: ${day}${counts.week} across ${window}. ${threshold}`);
  }

  // Unplanned looks ahead, so it only exists while some of the week is left --
  // one number, because "how much of what remains is unplanned" is the whole
  // question and a per-day split of the future answers a different one.
  if (summary.remaining) {
    const clear = !summary.unplanned;
    // "to Sat" is spelled from weekEnd rather than hard-coded so the label
    // follows startOfCoverageWeek if the week boundary ever moves.
    const label = summary.running ? `to ${weekday(summary.weekEnd)}` : isoRangeText(summary.weekStart, summary.weekEnd);
    const window = summary.running ? `now to the end of ${summary.weekEnd}` : `${summary.weekStart} to ${summary.weekEnd}`;
    chip("unplanned", clear, clear ? "Unplanned clear" : `Unplanned ${summary.unplanned}h ${label}`, clear
      ? `Every hour from ${window} has a plan block over it. ${threshold}`
      : `Hours left in the week with no plan block over them: ${summary.unplanned} from ${window}. ${threshold}`);
  }
  return wrap;
}

/* --- The footer strip -------------------------------------------------------

   One bar under the work area for the whole app. The calendar used to stack its
   own full-width "Copy work hours" bar on top of this row, so a view that was
   already short on vertical room paid for two bands of chrome; the work summary
   and its copy button are lent to this row instead when the calendar is open,
   and the five export buttons that used to sit here permanently now live behind
   a single menu. Same actions, one bar, one button visible at rest.
--------------------------------------------------------------------------- */

// The day everything in this footer is about. Not today -- paging back to last
// week and being told about this one makes the whole strip unreadable, since
// half of it would describe what is on screen and half would not.
function calendarFocusDate() {
  return calendarCursorDate || state.currentDate || todayISO();
}

function renderMiniRow() {
  const isCalendar = activeView === "calendar";
  els.miniRow.classList.toggle("is-calendar", isCalendar);
  els.miniRowStatus.innerHTML = "";
  if (!isCalendar) return;
  els.miniRowStatus.append(buildCoverageChips(coverageSummary(calendarFocusDate())));
}

function renderCalendarMonth() {
  const grid = document.createElement("div");
  grid.className = "calendar-month";
  for (const day of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) {
    const head = document.createElement("div");
    head.className = "calendar-day-name";
    head.textContent = day;
    grid.append(head);
  }
  const first = monthStart(calendarCursorDate);
  const start = startOfWeek(first);
  const month = calendarCursorDate.slice(0, 7);
  for (let i = 0; i < 42; i += 1) {
    const date = shiftISODate(start, i);
    const cell = document.createElement("div");
    cell.className = "calendar-month-cell";
    cell.classList.toggle("outside", !date.startsWith(month));
    cell.classList.toggle("is-today", date === todayISO());
    const head = document.createElement("button");
    head.type = "button";
    head.className = "calendar-cell-date";
    head.textContent = String(Number(date.slice(8, 10)));
    head.addEventListener("click", () => {
      calendarCursorDate = date;
      state.currentDate = date;
      saveLocal();
      render();
    });
    const add = document.createElement("button");
    add.type = "button";
    add.className = "calendar-cell-add";
    add.textContent = "+";
    add.addEventListener("click", () => openCalendarEditor(date));
    cell.append(head, add);
    // Month cells have no room for plan history; old plans live in the day view.
    const dayEvents = visibleCalendarEventsForDay(date).filter((event) => !event.supersededAt);
    for (const event of dayEvents.slice(0, 4)) cell.append(calendarEventChip(event));
    const extra = dayEvents.length - 4;
    if (extra > 0) {
      const more = document.createElement("span");
      more.className = "calendar-more";
      more.textContent = `+${extra} more`;
      cell.append(more);
    }
    grid.append(cell);
  }
  els.calendarView.append(grid);
}

function renderCalendarWeek() {
  const start = startOfWeek(calendarCursorDate);
  const dates = Array.from({ length: 7 }, (_, index) => shiftISODate(start, index));
  els.calendarView.append(calendarTimeGrid(dates, "week"));
}

function renderCalendarDay() {
  els.calendarView.append(calendarTimeGrid([calendarCursorDate], "day"));
}

function calendarTimeGrid(dates, mode) {
  const grid = document.createElement("div");
  grid.className = `calendar-time-grid calendar-time-grid-${mode}`;
  grid.style.setProperty("--calendar-days", String(dates.length));

  const header = document.createElement("div");
  header.className = "calendar-time-grid-header";
  header.append(calendarViewZonePicker(dates));
  for (const date of dates) header.append(calendarGridDayHeader(date));
  grid.append(header);

  const allDay = document.createElement("div");
  allDay.className = "calendar-grid-all-day";
  allDay.append(document.createElement("div"));
  for (const date of dates) {
    const cell = document.createElement("div");
    cell.className = "calendar-grid-all-day-cell";
    cell.dataset.date = date;
    for (const event of visibleCalendarEventsForDay(date).filter((item) => item.allDay)) cell.append(calendarEventChip(event));
    allDay.append(cell);
  }
  grid.append(allDay);

  const body = document.createElement("div");
  body.className = "calendar-grid-body";
  const times = document.createElement("div");
  times.className = "calendar-time-axis";
  for (let hour = CALENDAR_DAY_START_HOUR; hour < CALENDAR_DAY_END_HOUR; hour += 1) {
    const label = document.createElement("div");
    label.textContent = hourLabel(hour);
    times.append(label);
  }
  body.append(times);

  const days = document.createElement("div");
  days.className = "calendar-grid-days";
  days.style.setProperty("--calendar-days", String(dates.length));
  for (const date of dates) days.append(calendarGridDayColumn(date));
  days.append(nowLineForDates(dates));
  body.append(days);
  grid.append(body);
  return grid;
}

function calendarGridDayHeader(date) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "calendar-grid-day-header";
  button.classList.toggle("is-today", date === todayISO());
  const weekday = document.createElement("span");
  weekday.textContent = dateFromISO(date).toLocaleDateString(undefined, { weekday: "short" });
  const day = document.createElement("strong");
  day.textContent = String(Number(date.slice(8, 10)));
  button.append(weekday, day);
  if (isZoneTransitionDate(date)) {
    const badge = document.createElement("span");
    badge.className = "calendar-zone-badge";
    badge.textContent = "✈";
    badge.title = zoneDaySummaryText(date);
    button.append(badge);
  }
  button.addEventListener("click", () => {
    calendarCursorDate = date;
    state.currentDate = date;
    calendarMode = "day";
    saveLocal();
    render();
  });
  return button;
}

function calendarGridDayColumn(date) {
  const column = document.createElement("div");
  column.className = "calendar-grid-day";
  column.classList.toggle("is-today", date === todayISO());
  column.dataset.date = date;
  for (let hour = CALENDAR_DAY_START_HOUR; hour < CALENDAR_DAY_END_HOUR; hour += 1) {
    const slot = document.createElement("div");
    slot.className = "calendar-slot";
    slot.dataset.date = date;
    slot.dataset.hour = String(hour);
    slot.addEventListener("pointerdown", startCalendarSlotDrag);
    column.append(slot);
  }
  for (const overlay of calendarZoneOverlays(date)) column.append(overlay);
  const dayEvents = visibleCalendarEventsForDay(date).filter((item) => !item.allDay);
  // Deadlines are drawn as due lines, not blocks: they have no duration, so
  // handing them to the block layout would wedge zero-height chips into the
  // overlap cascade.
  const timedEvents = dayEvents.filter((item) => item.kind !== "deadline");
  const eventLayouts = calendarTimedEventLayouts(timedEvents, calendarKindFilter);
  // One rail per archived plan generation; the rail is the click target, its
  // sliver blocks are decoration that let the pointer through.
  for (const rail of eventLayouts.oldPlanRails || []) column.append(calendarOldPlanRail(rail));
  for (const event of timedEvents) column.append(calendarEventBlock(event, eventLayouts.get(event)));
  for (const event of dayEvents.filter((item) => item.kind === "deadline")) column.append(calendarDeadlineLine(event));
  return column;
}

// A deadline on the grid: a red dotted rule across the column at the moment
// something is due, with the title riding on it. Deliberately not a block --
// a due time has no duration to draw -- and deliberately loud: it is the one
// thing on the calendar that will not move to accommodate anything else.
function calendarDeadlineLine(event) {
  const line = document.createElement("button");
  line.type = "button";
  line.className = "calendar-deadline-line";
  const startMinutes = calendarEventStartMinutes(event);
  const totalMinutes = (CALENDAR_DAY_END_HOUR - CALENDAR_DAY_START_HOUR) * 60;
  line.style.top = `${((startMinutes - CALENDAR_DAY_START_HOUR * 60) / totalMinutes) * 100}%`;
  const planned = Boolean(deadlinePlanEvents(event.id).length);
  line.classList.toggle("is-unplanned", !planned);
  const label = document.createElement("span");
  label.textContent = `⚑ ${event.title} · due ${formatClockFromTime(minutesToClock(startMinutes))}`;
  line.title = [
    calendarEventFullTitle(event),
    `Due ${formatClockFromTime(minutesToClock(startMinutes))}`,
    event.estimateMinutes ? `Expected work: ${formatEstimate(event.estimateMinutes)}` : "",
    planned ? "Work time is booked" : "No work time booked yet"
  ].filter(Boolean).join("\n");
  line.append(label);
  line.addEventListener("click", () => openCalendarEventEditor(event));
  return line;
}

function calendarGridMinutesToPercent(minutes) {
  const total = (CALENDAR_DAY_END_HOUR - CALENDAR_DAY_START_HOUR) * 60;
  return ((minutes - CALENDAR_DAY_START_HOUR * 60) / total) * 100;
}

// Midnight at the end of a day is 24:00 here, not 00:00: these clocks label the
// ends of segments, and a segment reading "11:00-00:00" looks like it runs
// backwards.
function clockFromDayMinutes(minutes) {
  const clamped = Math.max(0, Math.min(1440, Math.round(minutes)));
  return `${String(Math.floor(clamped / 60)).padStart(2, "0")}:${String(clamped % 60).padStart(2, "0")}`;
}

/* What a move looks like on the grid.

   The column is a clock face, and on a travel day the clock stops being a
   straight line: a westward move draws part of the afternoon twice, an eastward
   one leaves an hour that nobody lived. Blocks are placed by clock as they
   always were -- the existing overlap cascade is what stacks the two 12:30s
   one over the other -- and these overlays are what stop that from reading as
   a double-booking or an unexplained empty patch.

   The rule is drawn where the clock jumped, labelled with the zone that starts
   there, so the column can be read top to bottom as one lived day. */
function calendarZoneOverlays(date) {
  const segments = dateZoneSegments(date);
  if (segments.length < 2) return [];
  const nodes = [];
  for (let index = 1; index < segments.length; index += 1) {
    const previous = segments[index - 1];
    const segment = segments[index];
    if (segment.startMinutes > previous.endMinutes) {
      const gap = document.createElement("div");
      gap.className = "calendar-zone-gap";
      gap.style.top = `${calendarGridMinutesToPercent(previous.endMinutes)}%`;
      gap.style.height = `${calendarGridMinutesToPercent(segment.startMinutes) - calendarGridMinutesToPercent(previous.endMinutes)}%`;
      gap.title = `${clockFromDayMinutes(previous.endMinutes)}–${clockFromDayMinutes(segment.startMinutes)} never happened — the clock jumped forward on the way to ${zoneCityLabel(segment.zone)}.`;
      nodes.push(gap);
    } else if (segment.startMinutes < previous.endMinutes) {
      const repeat = document.createElement("div");
      repeat.className = "calendar-zone-repeat";
      repeat.style.top = `${calendarGridMinutesToPercent(segment.startMinutes)}%`;
      repeat.style.height = `${calendarGridMinutesToPercent(previous.endMinutes) - calendarGridMinutesToPercent(segment.startMinutes)}%`;
      repeat.title = `${clockFromDayMinutes(segment.startMinutes)}–${clockFromDayMinutes(previous.endMinutes)} was lived twice — once in ${zoneCityLabel(previous.zone)}, then again in ${zoneCityLabel(segment.zone)}.`;
      nodes.push(repeat);
    }
    const rule = document.createElement("div");
    rule.className = "calendar-zone-rule";
    rule.style.top = `${calendarGridMinutesToPercent(segment.startMinutes)}%`;
    const label = document.createElement("span");
    label.textContent = `${zoneCityLabel(segment.zone)} ${clockFromDayMinutes(segment.startMinutes)}`;
    rule.append(label);
    nodes.push(rule);
  }
  return nodes;
}

// How long the day really ran, in words, for the header badge and the hour grid.
function zoneDaySummaryText(date) {
  const segments = dateZoneSegments(date);
  if (segments.length < 2) return "";
  const minutes = dateRealMinutes(date);
  const hours = Math.round((minutes / 60) * 10) / 10;
  const legs = segments
    .map((segment) => `${zoneCityLabel(segment.zone)} ${clockFromDayMinutes(segment.startMinutes)}–${clockFromDayMinutes(segment.endMinutes)}`)
    .join(", then ");
  return `${hours}-hour day: ${legs}.`;
}

function timeZoneLabel() {
  const match = new Date().toTimeString().match(/GMT[+-]\d{4}/);
  return match ? match[0].replace(/(\d{2})(\d{2})$/, "$1:$2") : "";
}

/* Which zone a pegged event should be re-localised into. The whole in-memory
   calendar is re-normalised when this changes, so the day index, the grids and
   the totals keep working in one consistent clock and none of them has to know
   the view zone exists. The stored file follows, which is harmless: start/end
   plus zone describe the same instant whichever zone they are written in. */
function isCalendarViewZoneMode(value) {
  return value === "lived" || value === "device" || isValidTimeZone(value);
}

function calendarViewZone(instant) {
  if (calendarViewZoneMode === "device") return currentTimeZone();
  if (isValidTimeZone(calendarViewZoneMode)) return calendarViewZoneMode;
  return zoneAtInstant(instant);
}

// What the header names the current mode.
function calendarViewZoneLabel(dates = []) {
  if (calendarViewZoneMode === "device") return zoneCityLabel(currentTimeZone());
  if (isValidTimeZone(calendarViewZoneMode)) return zoneCityLabel(calendarViewZoneMode);
  const zones = [...new Set(dates.map((date) => zoneForDate(date)))];
  // On a week that spans a move the header cannot name one zone honestly, so it
  // names the range instead and the day columns carry the detail.
  if (zones.length > 1) return `${zoneCityLabel(zones[0])} → ${zoneCityLabel(zones[zones.length - 1])}`;
  return zoneCityLabel(zones[0] || currentTimeZone());
}

function setCalendarViewZoneMode(mode) {
  calendarViewZoneMode = mode;
  // Re-localises every pegged event into the new clock; floating ones are
  // untouched by definition.
  state.calendarEvents = normalizeCalendarEvents(state.calendarEvents);
  invalidatePlanEventIndex();
  saveLocal();
  saveCalendarEvents();
  render();
}

function calendarViewZonePicker(dates) {
  const wrap = document.createElement("div");
  wrap.className = "calendar-time-zone";
  const select = document.createElement("select");
  select.className = "calendar-time-zone-select";
  select.setAttribute("aria-label", "Time zone the calendar is drawn in");
  const add = (value, label) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    option.selected = calendarViewZoneMode === value;
    select.append(option);
  };
  add("lived", "As lived");
  add("device", `Here (${zoneCityLabel(currentTimeZone())})`);
  for (const zone of knownZoneNames()) add(zone, zoneCityLabel(zone));
  select.addEventListener("change", () => setCalendarViewZoneMode(select.value));
  const label = document.createElement("span");
  label.className = "calendar-time-zone-label";
  label.textContent = calendarViewZoneLabel(dates);
  label.title = `${calendarViewZoneLabel(dates)} · ${timeZoneLabel()}`;
  wrap.append(select, label);
  return wrap;
}

function calendarEventChip(event) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "calendar-event-chip";
  button.classList.toggle("is-actual", event.kind === "actual");
  button.classList.toggle("is-deadline", event.kind === "deadline");
  button.classList.toggle("is-tentative", Boolean(event.tentative));
  button.classList.toggle("is-superseded", Boolean(event.supersededAt));
  button.classList.toggle("is-google", event.source === "google");
  button.classList.toggle("is-outlook", event.source === "outlook");
  // A deadline is red whatever category it is filed under: the colour is the
  // message, and a due date wearing a category pastel would read as one more
  // block to maybe get to.
  const eventColor = event.kind === "deadline" ? CALENDAR_DEADLINE_COLOR : event.color;
  button.style.borderLeftColor = eventColor;
  button.style.setProperty("--event-color", eventColor);
  const eventTextColors = readableEventColors(eventColor);
  button.style.setProperty("--event-text", eventTextColors.text);
  button.style.setProperty("--event-time-text", eventTextColors.muted);
  const time = document.createElement("span");
  time.textContent = event.kind === "deadline"
    ? [event.allDay ? "due today" : `due ${formatClockFromTime(event.start.slice(11, 16))}`, calendarEventSourceLabel(event)].filter(Boolean).join(" · ")
    : [calendarEventTimeLabel(event), event.kind, event.supersededAt ? "old" : "", event.tentative ? "fyi" : "", calendarEventSourceLabel(event)].filter(Boolean).join(" · ");
  const title = document.createElement("strong");
  // ◷ is the same glyph the task row uses to put work on the calendar, so it
  // reads as "a task lives here". It has to be visible on the block: dragging
  // one of these moves a task in another view, and a side effect nothing on
  // screen announces is a side effect that gets discovered by accident.
  const pegged = Boolean(peggedTaskFollowTarget(event));
  button.classList.toggle("is-pegged", pegged);
  title.textContent = event.kind === "deadline" ? `⚑ ${event.title}` : pegged ? `◷ ${event.title}` : event.title;
  // A block is only as tall as its duration, so its title is routinely clipped.
  // The tooltip is where the full text stays reachable without opening it.
  button.title = [calendarEventFullTitle(event), pegged ? "Pegged task — its due date follows this block" : ""].filter(Boolean).join("\n");
  button.append(title, time);
  if (!event.allDay && !isSyncedCalendarEvent(event) && event.kind !== "deadline" && !event.supersededAt) {
    button.append(calendarResizeHandle("top", event), calendarResizeHandle("bottom", event));
  }
  button.addEventListener("click", () => {
    if (calendarSuppressEventClickId === event.id) {
      calendarSuppressEventClickId = null;
      return;
    }
    openCalendarEventEditor(event);
  });
  return button;
}

function openCalendarEventEditor(event) {
  editingCalendarEventId = event.id;
  editingCalendarOccurrenceDate = event.occurrenceDate || event.start.slice(0, 10);
  calendarDraftEvent = null;
  calendarPersistentDraftPreview = null;
  calendarCursorDate = event.occurrenceDate || event.start.slice(0, 10);
  state.currentDate = calendarCursorDate;
  saveLocal();
  render();
}

function calendarResizeHandle(edge, event) {
  const handle = document.createElement("span");
  handle.className = `calendar-resize-handle is-${edge}`;
  handle.title = edge === "top" ? "Drag to adjust start time" : "Drag to adjust end time";
  handle.addEventListener("pointerdown", (pointerEvent) => {
    // Touch never resizes: the handles are slivers a scrolling finger crosses
    // constantly, and times are edited in the editor on a phone.
    if (pointerEvent.pointerType === "touch") return;
    startCalendarEventResize(pointerEvent, event, edge);
  });
  handle.addEventListener("click", (clickEvent) => {
    clickEvent.preventDefault();
    clickEvent.stopPropagation();
  });
  return handle;
}

function calendarEventSourceLabel(event) {
  if (event.source === "google") return "Google";
  if (event.source === "outlook") return "Outlook";
  return "";
}

// A superseded plan collapses to a rail: a thin clickable strip on the left
// edge of the day column, holding sliver-width copies of its blocks. Clicking
// the rail swaps the whole old plan in over the current one for a look;
// clicking it again puts it away. Only ever one open at a time.
function calendarOldPlanRail(rail) {
  const strip = document.createElement("button");
  strip.type = "button";
  strip.className = "calendar-old-plan-rail";
  strip.classList.toggle("is-open", rail.open);
  const archived = new Date(rail.stamp);
  const label = Number.isNaN(archived.getTime())
    ? "Old plan"
    : `Old plan · archived ${archived.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`;
  strip.title = `${label}\n${rail.open ? "Click to put it away" : "Click to see it over the current plan"}`;
  strip.setAttribute("aria-label", label);
  strip.setAttribute("aria-pressed", String(rail.open));
  strip.style.left = calendarEventInlineOffset("left", rail.x0, 0, calendarKindFilter === "both");
  strip.style.right = calendarEventInlineOffset("right", 1 - rail.x1, 0, calendarKindFilter === "both");
  strip.addEventListener("click", () => {
    calendarExpandedOldPlanStamp = calendarExpandedOldPlanStamp === rail.stamp ? null : rail.stamp;
    renderCalendarView();
  });
  return strip;
}

function calendarEventBlock(event, layout = null) {
  const block = calendarEventChip(event);
  block.classList.add("calendar-event-block");
  // An archived plan block is history: openable, never draggable.
  if (!event.supersededAt) block.addEventListener("pointerdown", (pointerEvent) => startCalendarEventMove(pointerEvent, event));
  const startMinutes = calendarEventStartMinutes(event);
  const endMinutes = Math.max(startMinutes + CALENDAR_SNAP_MINUTES, calendarEventEndMinutes(event));
  const totalMinutes = (CALENDAR_DAY_END_HOUR - CALENDAR_DAY_START_HOUR) * 60;
  block.style.top = `${((startMinutes - CALENDAR_DAY_START_HOUR * 60) / totalMinutes) * 100}%`;
  block.style.height = `max(22px, ${((endMinutes - startMinutes) / totalMinutes) * 100}%)`;
  if (layout) {
    block.style.left = calendarEventInlineOffset("left", layout.x0, layout.insetPx, layout.centerGutter);
    block.style.right = calendarEventInlineOffset("right", 1 - layout.x1, 0, layout.centerGutter);
    block.style.zIndex = String(3 + layout.depth);
    // A block that cascaded over another casts a shadow onto the strip it left
    // showing, so the leak reads as an edge with something behind it. An
    // as-lived block wears its colour bar on the right, not the left, so
    // without this its leak would be a pale strip and nothing else.
    block.classList.toggle("is-cascaded", Number(layout.level) > 0 && !layout.sliver);
    // A shorter block drawn over this one's head pushes its text down below
    // the cover (layoutCalendarEventCascade). Minutes become pixels through
    // the hour-height property so zoom, which does not re-render, still lands
    // the text in the right place.
    if (layout.headCover > 0 && !layout.sliver) {
      block.style.setProperty("--head-cover", `calc(var(--calendar-hour-height, 54px) * ${(layout.headCover / 60).toFixed(4)})`);
    }
    block.classList.toggle("is-sliver", Boolean(layout.sliver));
    block.classList.toggle("is-old-plan-open", Boolean(layout.oldPlanOpen));
  }
  // Overlapping blocks are stacked by their layout depth, which would let a
  // neighbour cover the very block being pointed at.
  if (block.classList.contains("is-unassigned-flag")) block.style.zIndex = "12";
  // A sliver hides its text entirely, so fitting it would only churn the
  // observer with boxes that never show a line.
  if (!layout?.sliver) observeCalendarEventBlock(block);
  return block;
}

function calendarEventInlineOffset(side, fraction, insetPx = 0, centerGutter = false) {
  const leftBase = 6 + insetPx;
  const rightBase = centerGutter ? 6 : 32;
  const base = side === "left" ? leftBase : rightBase;
  const reserved = centerGutter ? 12 + insetPx : 38 + insetPx;
  return `calc(${base}px + (100% - ${reserved}px) * ${Math.max(0, Math.min(1, fraction)).toFixed(4)})`;
}

/* --- Making the text fit the block ------------------------------------------

   An event block is absolutely positioned and its height comes from its
   duration, so the text has to be cut to the box rather than the box grown to
   the text. The chip clips in CSS, and this decides how much is worth showing:
   how many lines of title fit, and whether the time row earns its place at all.

   Nothing here is load-bearing for *correctness*: the title is capped at its
   grid row in styles.css, so a stale or missing fit costs a line of title, not
   a title painted over the time row. This picks where the cut falls.

   The three-way ladder, in order of what gets sacrificed first:
     tiny      one line of title, no time row, padding down to nothing
     compact   title only, using the full height of the block
     full      title clamped to the lines left over above the time row
--------------------------------------------------------------------------- */

// Only used when a line-height comes back as "normal" or otherwise unreadable;
// the real numbers are measured off the elements so styles.css stays the one
// place the type is described.
const CALENDAR_FALLBACK_LINE_HEIGHT = 15;
const CALENDAR_TINY_BLOCK_HEIGHT = 34;

let calendarTextFitObserver = null;

function measuredLineHeight(element) {
  const value = parseFloat(getComputedStyle(element).lineHeight);
  return Number.isFinite(value) && value > 0 ? value : CALENDAR_FALLBACK_LINE_HEIGHT;
}

// Works out what a single block should show. Split from the applying half so a
// pass over many blocks can reset, then measure, then write, instead of forcing
// a fresh layout per block.
function planCalendarEventText(block) {
  const title = block.querySelector("strong");
  const time = block.querySelector("span:not(.calendar-resize-handle)");
  if (!title || !time) return null;
  if (block.getBoundingClientRect().height < CALENDAR_TINY_BLOCK_HEIGHT) {
    return { block, lines: 1, compact: true, tiny: true };
  }
  // clientHeight is the padding box (box-sizing is border-box app-wide), so
  // only the padding has to come off to get the room the rows actually have.
  const styles = getComputedStyle(block);
  const inner = block.clientHeight - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom);
  const titleLine = measuredLineHeight(title);
  const withTime = Math.floor((inner - measuredLineHeight(time) - (parseFloat(styles.rowGap) || 0)) / titleLine);
  if (withTime >= 1) return { block, lines: withTime, compact: false, tiny: false };
  // The time row is the first thing dropped: the block's position on the hour
  // grid already says when it is, so a name beats a repeated time.
  return { block, lines: Math.max(1, Math.floor(inner / titleLine)), compact: true, tiny: false };
}

function fitCalendarEventBlocks(blocks) {
  // Slivers show no text at all, so there is nothing to fit.
  const list = [...blocks].filter((block) => block.isConnected && !block.classList.contains("is-sliver"));
  if (!list.length) return;
  // The reset has to come off every block before anything is measured: is-tiny
  // changes the padding and the clamp changes the title's height, so measuring
  // one block after re-fitting another would read a box mid-decision.
  for (const block of list) {
    block.classList.remove("is-compact", "is-tiny");
    block.style.removeProperty("--title-lines");
  }
  const plans = list.map(planCalendarEventText).filter(Boolean);
  for (const plan of plans) {
    plan.block.classList.toggle("is-compact", plan.compact);
    plan.block.classList.toggle("is-tiny", plan.tiny);
    plan.block.style.setProperty("--title-lines", String(plan.lines));
  }
}

function fitCalendarEventText() {
  fitCalendarEventBlocks(document.querySelectorAll(".calendar-event-block"));
}

/* A block re-fits itself whenever its own box changes, rather than only at the
   call sites that remember to ask. The height changes on zoom, on a window or
   pane resize, when a column narrows and the titles rewrap, and on the render
   that built it -- and every one of those used to be able to leave a line count
   behind that was decided for a different height.

   ResizeObserver also delivers the first measurement itself, before paint, so
   there is no frame where a block is drawn unfitted. The old pass ran inside
   requestAnimationFrame, which does not run at all while the window is hidden
   or occluded: a calendar rendered in the background stayed unfitted. */
function observeCalendarEventBlock(block) {
  if (typeof ResizeObserver !== "function") return;
  if (!calendarTextFitObserver) {
    calendarTextFitObserver = new ResizeObserver((entries) => {
      fitCalendarEventBlocks(entries.map((entry) => entry.target));
    });
  }
  // Border-box, because is-tiny drops the padding: watching the content box
  // would make the fit's own result look like a resize and cost a second pass.
  calendarTextFitObserver.observe(block, { box: "border-box" });
}

// A render throws away every block, and the observer holds on to its targets,
// so the old ones are dropped before the new ones are made. The calendar
// re-renders on every edit and every sync, which adds up quickly otherwise.
function resetCalendarTextFitObserver() {
  calendarTextFitObserver?.disconnect();
}

// Width of one archived-plan rail, as a fraction of the day column.
const CALENDAR_OLD_PLAN_RAIL_WIDTH = 0.05;

/* How far one block steps right of the block it lands on top of, and so how
   much of that block's left edge is left showing. Wide enough to read as a
   coloured edge and to be clickable, narrow enough that it costs the block on
   top almost nothing. Keep it above the 4px accent border in styles.css or the
   leak is just the border and reads as a thicker line. */
const CALENDAR_OVERLAP_STEP_PX = 14;

// Past a few levels the step shrinks: a badly stacked morning should not walk
// the last block off the right of a narrow week column.
function calendarOverlapInset(level) {
  const full = Math.min(level, 3);
  return full * CALENDAR_OVERLAP_STEP_PX + Math.max(0, level - 3) * 5;
}

function calendarTimedEventLayouts(events, kindFilter = calendarKindFilter, expandedStamp = calendarExpandedOldPlanStamp) {
  const items = events.map((event) => ({
    event,
    start: calendarEventStartMinutes(event),
    end: Math.max(calendarEventStartMinutes(event) + CALENDAR_SNAP_MINUTES, calendarEventEndMinutes(event)),
    x0: 0,
    x1: 1,
    depth: 0,
    level: 0,
    insetPx: 0,
    headCover: 0,
    sliver: false,
    oldPlanOpen: false,
    centerGutter: kindFilter === "both"
  }));

  /* Every block goes through the cascade, nested or not: a block wholly inside
     another simply starts later and steps one notch right of it, which is what
     the old containment tree was built to arrange by hand. The tree also had to
     refuse to nest across plan generations and across plan/actual -- those
     never share a cascade now, because each is laid out in its own call. */
  const currentItems = items.filter((item) => !item.event.supersededAt);
  // Old plans stack as thin rails on the left edge, oldest leftmost. The strip
  // is capped so a much-re-planned day cannot squeeze out the plan actually in
  // force, and the current plan starts where the rails end.
  const stamps = [...new Set(items.filter((item) => item.event.supersededAt).map((item) => item.event.supersededAt))].sort();
  const strip = stamps.length ? Math.min(CALENDAR_OLD_PLAN_RAIL_WIDTH * stamps.length, 0.18) : 0;
  const currentStart = stamps.length ? strip + 0.015 : 0;
  const planEnd = kindFilter === "both" ? 0.42 : 1;
  if (kindFilter === "both") {
    layoutCalendarEventCascade(currentItems.filter((item) => item.event.kind !== "actual"), currentStart, 0.42, 0, 0);
    layoutCalendarEventCascade(currentItems.filter((item) => item.event.kind === "actual"), 0.58, 1, 0, 0);
  } else {
    layoutCalendarEventCascade(currentItems, currentStart, 1, 0, 0);
  }
  const rails = [];
  stamps.forEach((stamp, index) => {
    const laneWidth = strip / stamps.length;
    const x0 = laneWidth * index;
    const x1 = x0 + laneWidth - Math.min(0.008, laneWidth * 0.15);
    const open = stamp === expandedStamp;
    rails.push({ stamp, x0, x1, open });
    const groupItems = items.filter((item) => (item.event.supersededAt || "") === stamp);
    if (open) {
      // Brought back for a look: the old plan lays out over the current plan's
      // area. Depth 6 keeps its blocks above current ones (z is 3 + depth).
      layoutCalendarEventCascade(groupItems, currentStart, planEnd, 6, 0);
      for (const item of groupItems) item.oldPlanOpen = true;
    } else {
      // Put away: every block, nested or not, becomes a sliver in the rail.
      for (const item of groupItems) {
        item.x0 = x0;
        item.x1 = x1;
        item.depth = 0;
        item.level = 0;
        item.insetPx = 0;
        item.headCover = 0;
        item.sliver = true;
      }
    }
  });
  const layouts = new Map();
  for (const item of items) {
    layouts.set(item.event, {
      x0: item.x0,
      x1: item.x1,
      depth: item.depth,
      level: item.level,
      insetPx: item.insetPx,
      headCover: item.headCover,
      centerGutter: item.centerGutter,
      sliver: item.sliver,
      oldPlanOpen: item.oldPlanOpen
    });
  }
  layouts.oldPlanRails = rails;
  return layouts;
}

/* Overlap as a cascade rather than a split.

   Every block keeps the full width of the range it was given. Where two blocks
   share hours, the shorter one is drawn on top, stepped CALENDAR_OVERLAP_STEP_PX
   to the right of the one underneath, so what shows of the block underneath
   for those hours is a leak of its coloured left edge -- and above and below
   those hours the block underneath is back at its full width, because nothing
   is covering it there.

   The old layout gave each block in an overlap group an equal lane, which cost
   it half its width (or a third, or a quarter) for its whole duration, hours
   where nothing overlapped it included. A 9-11 block lost half its width to a
   ten-minute call at 10:00.

   Shorter on top, not later on top. The first cascade put whichever block
   opened later on top, which is right for two blocks that merely overlap (the
   one underneath keeps its head, where its title is) and wrong the moment a
   long block opens a few minutes after a short one and runs on past it: the
   short block was left a sliver of head and a 14px leak, and a half-hour call
   vanished inside a three-hour work block. Now the short block is on top
   whatever the order they opened in, and the long block underneath pays for it
   with its head rather than its existence -- see headCover.

   Nothing here cuts a notch out of a shape: blocks are opaque (see
   .calendar-event-chip in styles.css), so the block on top does the hiding.
   A covered title is unreadable while it is covered, which is what the :hover
   lift in styles.css is for. */
function layoutCalendarEventCascade(items, rangeStart, rangeEnd, depth, insetPx) {
  if (!items.length) return;
  for (const group of calendarOverlapGroups(items)) {
    // Longest first, so a block is placed after every block it will sit on
    // top of; equal lengths go in start order, so the later one lands on top.
    const order = [...group].sort(compareCalendarCascadeOrder);
    const placed = [];
    for (const item of order) {
      const under = placed.filter((other) => calendarBlocksOverlap(other, item));
      // One notch right of the deepest block underneath, not of how many there
      // are: two blocks sharing a level would land on the same left edge and
      // the lower one's leak would vanish.
      item.level = under.length ? Math.max(...under.map((other) => other.level)) + 1 : 0;
      item.depth = depth + item.level;
      item.insetPx = insetPx + calendarOverlapInset(item.level);
      item.x0 = rangeStart;
      item.x1 = rangeEnd;
      placed.push(item);
    }
    for (const item of group) item.headCover = calendarHeadCoverMinutes(item, group);
  }
}

function compareCalendarCascadeOrder(a, b) {
  const byLength = (b.end - b.start) - (a.end - a.start);
  if (byLength) return byLength;
  return a.start - b.start;
}

function calendarBlocksOverlap(a, b) {
  return a.start < b.end && b.start < a.end;
}

/* How far into a block its text has to start because shorter blocks are drawn
   over its head.

   A block above another (more shallowly placed, so a higher level) that opens
   at or within CALENDAR_HEAD_COVER_SLACK_MINUTES of its top hides the rows
   where its title would be drawn; the text moves down to where that cover
   ends. Covers are walked in start order so one that begins where the last
   left off keeps pushing -- a 9:00-9:30 call on top of a 9:05-12:00 work block
   followed by a 9:30-9:45 call moves the work block's title to 9:45, not to
   9:30 where the second call would hide it again. The result is minutes, so it
   is zoom-independent; calendarEventBlock() turns it into padding through the
   hour height custom property. */
const CALENDAR_HEAD_COVER_SLACK_MINUTES = 15;

function calendarHeadCoverMinutes(item, group) {
  const covers = group
    .filter((other) => other !== item && other.level > item.level && calendarBlocksOverlap(other, item))
    .sort((a, b) => a.start - b.start);
  let textStart = item.start;
  for (const cover of covers) {
    if (cover.start > textStart + CALENDAR_HEAD_COVER_SLACK_MINUTES) break;
    textStart = Math.max(textStart, cover.end);
  }
  return Math.max(0, Math.min(item.end, textStart) - item.start);
}

function calendarOverlapGroups(items) {
  const sorted = [...items].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.end - a.end;
  });
  const groups = [];
  let group = [];
  let groupEnd = -1;
  for (const item of sorted) {
    if (!group.length || item.start < groupEnd) {
      group.push(item);
      groupEnd = Math.max(groupEnd, item.end);
    } else {
      groups.push(group);
      group = [item];
      groupEnd = item.end;
    }
  }
  if (group.length) groups.push(group);
  return groups;
}

function nowLineForDates(dates) {
  const line = document.createElement("div");
  line.className = "calendar-now-line";
  line.dataset.dates = dates.join(",");
  updateCalendarNowLine(line, dates);
  return line;
}

function updateCalendarNowLine(line, dates, now = new Date()) {
  const today = isoFromDate(now);
  const index = dates.indexOf(today);
  if (index === -1) {
    line.classList.add("hidden");
    return;
  }
  line.classList.remove("hidden");
  const minutes = now.getHours() * 60 + now.getMinutes();
  const totalMinutes = (CALENDAR_DAY_END_HOUR - CALENDAR_DAY_START_HOUR) * 60;
  line.style.top = `${((minutes - CALENDAR_DAY_START_HOUR * 60) / totalMinutes) * 100}%`;
  line.style.left = `calc(${index} * (100% / ${dates.length}))`;
  line.style.width = `calc(100% / ${dates.length})`;
}

function updateCalendarNowLines() {
  document.querySelectorAll(".calendar-now-line").forEach((line) => {
    const dates = String(line.dataset.dates || "").split(",").filter(Boolean);
    if (dates.length) updateCalendarNowLine(line, dates);
  });
}

function startCalendarNowLineUpdates() {
  if (calendarNowLineTimer) return;
  const scheduleNextUpdate = () => {
    updateCalendarNowLines();
    refreshCoverageChips();
    const millisecondsToNextMinute = 60000 - (Date.now() % 60000);
    calendarNowLineTimer = setTimeout(scheduleNextUpdate, millisecondsToNextMinute);
  };
  scheduleNextUpdate();
}

// Swapped in place on the same minute tick as the now line rather than through
// a full renderMiniRow(), which would rebuild the copy menu and the unassigned
// list under whoever happened to have one of them open.
function refreshCoverageChips() {
  const existing = els.miniRowStatus.querySelector(".coverage-split");
  if (existing) existing.replaceWith(buildCoverageChips(coverageSummary(calendarFocusDate())));
}

/* --- Placing a task on the calendar -----------------------------------------

   Pressing the calendar button on a task picks it up: the task rides the cursor
   as a bubble and the next click on the day grid drops it there as a plan event,
   starting at the time under the pointer and running for its estimate. One
   gesture, so scheduling the day costs about as much as reading the list.

   Deliberately not HTML5 drag-and-drop. The task rows are already draggable for
   reordering, and a second drag meaning would collide; a click-to-arm mode also
   survives switching from the Tasks view to the Calendar view mid-gesture, which
   a drag cannot.
--------------------------------------------------------------------------- */

const TASK_PLACEMENT_DEFAULT_MINUTES = 30;

function taskPlacementMinutes(task) {
  return normalizeEstimateMinutes(task?.estimateMinutes) || TASK_PLACEMENT_DEFAULT_MINUTES;
}

// The category the task's block lands in. An explicit choice on the task wins;
// otherwise the keyword matcher the hours log already uses gets a vote, so
// "gym at 6" lands as E without anyone setting a field. "" means the block is
// placed uncategorised, which is what every placement did before.
//
// Deliberately resolved when the task is picked up, not when it is dropped: the
// bubble and the preview say which category is about to be committed, so a bad
// guess is visible before the click rather than after it.
function taskCalendarCategory(task) {
  return normalizeCalendarCategory(task?.calendarCategory) || normalizeCalendarCategory(categorize(task?.text || ""));
}

// The control that decides it, one letter wide so it fits the meta row beside
// the estimate. Blank is not "no category" -- it is "use the keyword guess" --
// so the blank option shows what that guess currently is, and the border
// carries the colour the block will land in either way.
function taskCategorySelect(task, onChange) {
  const explicit = normalizeCalendarCategory(task?.calendarCategory);
  const guessed = normalizeCalendarCategory(categorize(task?.text || ""));
  const select = document.createElement("select");
  select.className = "task-category-select";
  const auto = document.createElement("option");
  auto.value = "";
  auto.textContent = guessed ? `·${guessed}` : "·";
  select.append(auto);
  for (const category of CALENDAR_CATEGORIES) {
    const option = document.createElement("option");
    option.value = category.code;
    option.textContent = category.code;
    select.append(option);
  }
  select.value = explicit;
  select.title = [
    "Calendar category for this task's block",
    guessed ? `· = auto (${guessed} = ${categoryLabel(guessed)})` : "· = auto (nothing guessed)",
    "",
    ...CALENDAR_CATEGORIES.map((category) => `${category.code} = ${category.label}`)
  ].join("\n");
  const resolved = explicit || guessed;
  if (resolved) select.style.borderColor = categoryColor(resolved);
  select.addEventListener("focus", deferTaskSync);
  select.addEventListener("change", () => onChange(select.value));
  return select;
}

// The plan block a task already has, if any. Earliest one from the day being
// viewed onward: a block from last Tuesday is history, not a schedule, and
// saying "scheduled" about it would be a lie the task list tells every day.
//
// The `taskId` link wins, but an unlinked plan event with the same title counts
// too — days were being planned by hand long before the placement button
// existed, and a block named "15 LinkedIn points" is that task scheduled no
// matter which surface typed it.
function scheduledPlanEventForTask(task) {
  if (!task?.id) return null;
  const text = String(task.text || "").trim();
  const index = planEventIndex(state.currentDate || todayISO());
  return index.byTaskId.get(task.id) || (text ? index.byTitle.get(text) || null : null) || null;
}

// One pass over the events instead of one per task button. Every mutation path
// runs the list back through normalizeCalendarEvents(), which returns a fresh
// array, so array identity is a reliable cache key -- an edited calendar is
// never the same array object as the one this index was built from.
let planEventIndexCache = null;
let planEventIndexSource = null;
let planEventIndexFrom = null;

function planEventIndex(from) {
  const source = state.calendarEvents || [];
  if (planEventIndexCache && planEventIndexSource === source && planEventIndexFrom === from) {
    return planEventIndexCache;
  }
  const byTaskId = new Map();
  const byTitle = new Map();
  for (const event of source) {
    // An archived plan block is not a booking: the ◷ button must not light up
    // off a plan that reality already overtook.
    if (event.kind !== "plan" || event.supersededAt || event.start.slice(0, 10) < from) continue;
    if (event.taskId) {
      const current = byTaskId.get(event.taskId);
      if (!current || event.start < current.start) byTaskId.set(event.taskId, event);
    } else {
      const current = byTitle.get(event.title);
      if (!current || event.start < current.start) byTitle.set(event.title, event);
    }
  }
  planEventIndexCache = { byTaskId, byTitle };
  planEventIndexSource = source;
  planEventIndexFrom = from;
  return planEventIndexCache;
}

function invalidatePlanEventIndex() {
  planEventIndexCache = null;
  planEventIndexSource = null;
  planEventIndexFrom = null;
}

/* --- Pegged tasks: the block is the schedule ---------------------------------

   A plan block carrying `taskId` is more than a note that work was booked for a
   task -- it is where that task is due. Drag the block to Thursday and the
   task's due date follows it, so a replan is done once, on the calendar,
   instead of twice in two places that quietly drift apart.

   (Not the same peg as `tz`, which pegs an event to a time zone. Same word,
   different rope: this one ties a task to a block.)

   The link is only ever the explicit `taskId`. `scheduledPlanEventForTask()`
   also counts an unlinked block whose title matches a task, which is right for
   lighting an indicator and wrong for this: a block called "gym" must not
   silently reschedule a task called "gym" that nobody connected to it. The
   editor's "Pegged task" select is how a block drawn by hand gets the link.

   Only a current plan block moves anything. An `actual` block carrying taskId
   is a record of work already done, and an archived one (`supersededAt`) is a
   plan reality overtook -- following either would drag a task backwards into
   history.
--------------------------------------------------------------------------- */

// The day a pegged task should be due, or null if this event pegs nothing.
function peggedTaskFollowTarget(event) {
  if (!event || event.kind !== "plan" || event.supersededAt) return null;
  const taskIdValue = String(event.taskId || "").trim();
  const date = String(event.start || "").slice(0, 10);
  if (!taskIdValue || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  return { taskId: taskIdValue, date };
}

/* The open task with this id, wherever it is filed. The section a task is found
   in is confirmed through taskRef() rather than trusted from the scan: a
   `rightNow` list left behind in an old entry is dead storage -- every rightNow
   lookup goes to today (`taskStorageDate()`) -- and moving a task nobody can
   see would be a write into a list the app never reads back. Completed and
   discarded tasks are deliberately not searched: a task that is done has no due
   date left to move. */
function findTaskRefById(taskIdValue) {
  const wanted = String(taskIdValue || "").trim();
  if (!wanted) return null;
  for (const [date, entry] of Object.entries(state.entries || {})) {
    for (const sectionKey of TASK_SECTION_KEYS) {
      const list = entry?.tasks?.[sectionKey];
      if (!Array.isArray(list) || !list.some((task) => task?.id === wanted)) continue;
      const ref = taskRef(sectionKey, wanted, date);
      if (ref) return { sectionKey, ref };
    }
  }
  return null;
}

/* What moving this block does to its pegged task, worked out before anything is
   written. `dueDate || ref.date` is the same reading of "what day is this task
   for" that placement uses: an undated task belongs to the day it is filed
   under, so pegging one to a block on another day dates it. A block that lands
   on the day the task is already due changes nothing -- dragging 09:00 to 14:00
   is not a reschedule. */
function peggedTaskDueDateChange(event, found) {
  const target = peggedTaskFollowTarget(event);
  if (!target || !found?.ref) return null;
  const from = found.ref.task.dueDate || found.ref.date;
  if (from === target.date) return null;
  return {
    sectionKey: found.sectionKey,
    taskId: target.taskId,
    sourceDate: found.ref.date,
    text: found.ref.task.text || "Task",
    from,
    to: target.date
  };
}

/* Applies the follow, and is the only thing that writes. It takes an id rather
   than an event because every caller runs after normalizeCalendarEvents(),
   which rebuilds every event object: a reference taken before the save is a
   different object than the one on state by the time this runs. */
function followPeggedTaskDueDate(eventId) {
  const event = state.calendarEvents.find((item) => item.id === eventId);
  const target = peggedTaskFollowTarget(event);
  if (!target) return null;
  const change = peggedTaskDueDateChange(event, findTaskRefById(target.taskId));
  if (!change) return null;
  updateTaskMeta(change.sectionKey, change.taskId, { dueDate: change.to }, change.sourceDate, {
    // Said out loud because the row that moved is in another view: a task
    // silently changing date is the one failure mode this would otherwise add.
    status: `${change.text} now due ${formatShortDate(change.to)}`
  });
  return change;
}

/* Every task a peg could point at, nearest day first with the undated ones
   after. Same taskRef() confirmation as the finder, so the list only offers
   tasks that a follow could actually move. */
function peggableTaskOptions() {
  const items = [];
  const seen = new Set();
  for (const [date, entry] of Object.entries(state.entries || {})) {
    for (const sectionKey of TASK_SECTION_KEYS) {
      for (const task of entry?.tasks?.[sectionKey] || []) {
        if (!task?.id || seen.has(task.id) || !taskRef(sectionKey, task.id, date)) continue;
        seen.add(task.id);
        items.push({
          id: task.id,
          dueDate: task.dueDate || "",
          label: `${task.text || "Untitled"} · ${task.dueDate ? formatShortDate(task.dueDate) : "undated"}`
        });
      }
    }
  }
  return items.sort((a, b) => {
    if (Boolean(a.dueDate) !== Boolean(b.dueDate)) return a.dueDate ? -1 : 1;
    if (a.dueDate !== b.dueDate) return a.dueDate < b.dueDate ? -1 : 1;
    return a.label.localeCompare(b.label);
  });
}

/* Makes the task a peg was asked for and returns its id. Filed on the block's
   own day rather than in the inbox, because the block already answered the
   question the inbox exists to ask -- and a due date is what a peg has to have
   to be able to move one. The block's length and category ride along, so the
   task can be dropped back on the calendar later without being re-decided.

   The quick-add grammar still runs (#project, @label, p1), which is why the
   due date is written after parsing: a "tomorrow" typed here would otherwise
   date the task somewhere the block is not, and the first move of the block
   would drag it back anyway. */
function createPeggedTask(text, { date, category = "", estimateMinutes = 0 } = {}) {
  const parsed = parseTaskInput(text, "today");
  if (!parsed.task.text.trim()) return "";
  deferTaskSync();
  const dueDate = /^\d{4}-\d{2}-\d{2}$/.test(String(date || "")) ? date : taskStorageDate(state.currentDate, "today");
  parsed.task.dueDate = dueDate;
  if (!parsed.task.estimateMinutes) parsed.task.estimateMinutes = normalizeEstimateMinutes(estimateMinutes);
  if (!parsed.task.calendarCategory) parsed.task.calendarCategory = normalizeCalendarCategory(category);
  pushUniqueTask(tasksForDate(dueDate, "today"), parsed.task);
  saveEverywhere({ extraDates: dueDate === state.currentDate ? [] : [dueDate] });
  renderTasksView();
  renderSidePanel();
  return parsed.task.id;
}

/* How long the block in the form runs, in minutes -- the estimate a task made
   from it inherits. All-day answers 0: "all day" is where a thing sits, not a
   claim about how long the work takes. The end date is already the overnight
   answer by the time this is called, so a 23:00-01:00 block is 120 minutes. */
function calendarBlockMinutes(date, startTime, endDate, endTime, allDay) {
  if (allDay) return 0;
  const overnight = endDate && endDate > date ? 1440 : 0;
  const minutes = calendarDateTimeToMinutes(`${date}T${endTime}`) + overnight - calendarDateTimeToMinutes(`${date}T${startTime}`);
  return minutes > 0 ? minutes : 0;
}

/* The peg the form is asking for, which on "+ New task" means creating it. The
   created id is remembered on the select because the form is read more than
   once on the way to being saved -- the recurring-scope chooser re-reads it
   after asking, and a split reads it for each half -- and every read after the
   first must find the same task, not make another one.

   A peg only means anything on a plan block (peggedTaskFollowTarget), so a row
   left on "+ New task" while the kind is switched to actual or deadline writes
   nothing and creates nothing. */
function taskPegIdFromForm(form, context) {
  const select = form.querySelector('select[name="taskId"]');
  if (!select) return "";
  const chosen = String(select.value || "").trim();
  if (chosen !== NEW_PEG_TASK_VALUE) return chosen;
  if (select.dataset.createdTaskId) return select.dataset.createdTaskId;
  const kind = form.querySelector('input[name="kind"]:checked')?.value || "plan";
  const text = String(form.querySelector('[name="newTaskText"]')?.value || "").trim();
  if (context.createTask === false || kind !== "plan" || !text) return "";
  const created = createPeggedTask(text, context);
  if (created) select.dataset.createdTaskId = created;
  return created;
}

/* --- Deadlines: the nag that ends when the work is booked --------------------

   A deadline is a calendar event (kind "deadline") whose start is the moment
   something is due. Knowing when it is due is half the job; the other half is
   booking time to do it, and that is what these answer: every upcoming
   deadline, and whether a plan block (carrying deadlineId) is booked for it.
   Unplanned ones surface in the Tasks view and the rail until one is.
--------------------------------------------------------------------------- */

const DEADLINE_LOOKAHEAD_DAYS = 180;

// The next moment a deadline falls due, from now on. A recurring deadline (a
// weekly problem set) answers with its next occurrence; one whose last
// occurrence has passed answers null and stops nagging.
function nextDeadlineOccurrence(event, nowStamp = isoDateTimeFromDate(new Date())) {
  if (event?.kind !== "deadline") return null;
  // An all-day deadline is due when the day ends, not at midnight the night
  // before -- "due Friday" means you still have Friday.
  const dueTime = event.allDay ? "23:59" : event.start.slice(11, 16);
  if (!event.recurrence || event.recurrence === "none") {
    const date = event.start.slice(0, 10);
    const dueAt = `${date}T${dueTime}`;
    return dueAt >= nowStamp ? { date, dueAt } : null;
  }
  const today = nowStamp.slice(0, 10);
  for (let offset = 0; offset <= DEADLINE_LOOKAHEAD_DAYS; offset += 1) {
    const date = shiftISODate(today, offset);
    if (event.recurrenceEndDate && date >= event.recurrenceEndDate) return null;
    if (!recurringEventTouchesDate(event, date)) continue;
    const dueAt = `${date}T${dueTime}`;
    if (dueAt >= nowStamp) return { date, dueAt };
  }
  return null;
}

// Every plan block booked for a deadline, today onward, earliest first. A block
// from last Tuesday that never happened is history, not a booking -- the same
// rule scheduledPlanEventForTask applies -- so a missed work session puts the
// deadline straight back on the nag list.
function deadlinePlanEvents(deadlineId, from = todayISO()) {
  if (!deadlineId) return [];
  return (state.calendarEvents || [])
    // Archiving a booked work block un-books it -- the deadline goes straight
    // back on the nag list, which is the point of re-planning.
    .filter((event) => event.kind === "plan" && !event.supersededAt && event.deadlineId === deadlineId && event.start.slice(0, 10) >= from)
    .sort((a, b) => a.start.localeCompare(b.start));
}

function upcomingDeadlineItems() {
  const nowStamp = isoDateTimeFromDate(new Date());
  const items = [];
  for (const event of state.calendarEvents || []) {
    if (event.kind !== "deadline") continue;
    const next = nextDeadlineOccurrence(event, nowStamp);
    if (!next) continue;
    items.push({
      event,
      occurrenceDate: next.date,
      dueAt: next.dueAt,
      planned: Boolean(deadlinePlanEvents(event.id).length)
    });
  }
  return items.sort((a, b) => a.dueAt.localeCompare(b.dueAt));
}

function deadlineDueLabel(item) {
  const day = dateFromISO(item.occurrenceDate).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  return item.event.allDay ? `due ${day}` : `due ${day} · ${formatClockFromTime(item.dueAt.slice(11, 16))}`;
}

// One nag row, shared by the Tasks view panel and the rail: the words open the
// deadline on the calendar, the ◷ picks it up for placement. No checkbox --
// a deadline is not completable here, only plannable.
function deadlineNagRow(item) {
  const row = document.createElement("div");
  row.className = "deadline-row";
  const open = document.createElement("button");
  open.type = "button";
  open.className = "deadline-row-text";
  const title = document.createElement("strong");
  title.textContent = `⚑ ${item.event.title}`;
  const meta = document.createElement("span");
  const estimate = normalizeEstimateMinutes(item.event.estimateMinutes);
  meta.textContent = [deadlineDueLabel(item), estimate ? `~${formatEstimate(estimate)}` : ""].filter(Boolean).join(" · ");
  open.append(title, meta);
  open.title = "Open this deadline on the calendar";
  open.addEventListener("click", () => openDeadlineOnCalendar(item));
  const plan = document.createElement("button");
  plan.type = "button";
  plan.className = "place-task-button deadline-plan-button";
  plan.textContent = "◷";
  plan.title = `Book work time (${formatEstimate(estimate || TASK_PLACEMENT_DEFAULT_MINUTES)})`;
  plan.setAttribute("aria-label", plan.title);
  plan.addEventListener("click", () => startDeadlinePlacement(item.event));
  row.append(open, plan);
  return row;
}

function deadlinePlanPanel(items) {
  const panel = document.createElement("section");
  panel.className = "task-section is-deadlines";
  const head = document.createElement("div");
  head.className = "task-section-head";
  const heading = document.createElement("h3");
  heading.textContent = "Deadlines to plan";
  const count = document.createElement("span");
  count.textContent = String(items.length);
  head.append(heading, count);
  panel.append(head);
  const hint = document.createElement("p");
  hint.className = "deadline-panel-hint";
  hint.textContent = "Due dates with no work time booked yet — ◷ drops a block on the calendar.";
  panel.append(hint);
  const list = document.createElement("div");
  list.className = "deadline-list";
  for (const item of items) list.append(deadlineNagRow(item));
  panel.append(list);
  return panel;
}

// Jump from a nag row to the deadline itself, wherever the row lives.
function openDeadlineOnCalendar(item) {
  editingCalendarEventId = item.event.id;
  editingCalendarOccurrenceDate = item.occurrenceDate;
  calendarDraftEvent = null;
  calendarPersistentDraftPreview = null;
  calendarCursorDate = item.occurrenceDate;
  state.currentDate = item.occurrenceDate;
  saveLocal();
  if (activeView !== "calendar") setView("calendar");
  else render();
}

// Zero extra layout: the button that schedules the task is also the light that
// says whether it is scheduled.
function applyPlaceButtonState(button, task) {
  const planned = scheduledPlanEventForTask(task);
  button.classList.toggle("is-scheduled", Boolean(planned));
  if (!planned) {
    const category = taskCalendarCategory(task);
    const filed = category ? `, ${category} = ${categoryLabel(category)}` : "";
    button.title = `Put on the calendar plan (${formatEstimate(taskPlacementMinutes(task))}${filed})`;
  } else {
    const day = planned.start.slice(0, 10);
    const when = `${formatClockFromTime(planned.start.slice(11, 16))}${day === state.currentDate ? "" : ` ${formatShortDate(day)}`}`;
    button.title = `Planned for ${when} — click to place another block`;
  }
  button.setAttribute("aria-label", button.title);
}

function startTaskPlacement(sectionKey, task, sourceDate) {
  taskPlacement = {
    sectionKey,
    taskId: task.id,
    sourceDate: sourceDate || state.currentDate,
    text: task.text || "Untitled",
    minutes: taskPlacementMinutes(task),
    category: taskCalendarCategory(task),
    // Carried only to be shown while aiming. Placement stays a click on the
    // grid: a time typed into quick-add is an intention, and dropping the block
    // there automatically would book work that was never looked at on a day.
    dueTime: task.dueTime || ""
  };
  armTaskPlacementMode();
}

// The same click-to-arm gesture, picking up a deadline instead of a task: the
// dropped plan block carries deadlineId back, which is what answers "has work
// been booked for this?" and clears the deadline out of the nag list.
function startDeadlinePlacement(event) {
  taskPlacement = {
    deadlineId: event.id,
    text: event.title || "Untitled",
    minutes: normalizeEstimateMinutes(event.estimateMinutes) || TASK_PLACEMENT_DEFAULT_MINUTES,
    category: normalizeCalendarCategory(event.category) || normalizeCalendarCategory(categorize(event.title || "")),
    dueTime: ""
  };
  armTaskPlacementMode();
}

function armTaskPlacementMode() {
  // The grid has to be on screen to be clicked, and month cells have no time.
  if (calendarMode === "month") calendarMode = "day";
  if (activeView !== "calendar") setView("calendar");
  else render();
  window.addEventListener("pointermove", updateTaskPlacementBubble);
  window.addEventListener("keydown", cancelTaskPlacementOnEscape, true);
  document.body.classList.add("is-placing-task");
  renderTaskPlacementBubble();
}

function cancelTaskPlacement() {
  if (!taskPlacement) return;
  taskPlacement = null;
  window.removeEventListener("pointermove", updateTaskPlacementBubble);
  window.removeEventListener("keydown", cancelTaskPlacementOnEscape, true);
  document.body.classList.remove("is-placing-task");
  document.querySelector(".task-placement-bubble")?.remove();
  clearCalendarDraftPreview();
  renderTasksView();
  renderSidePanel();
}

function cancelTaskPlacementOnEscape(event) {
  if (event.key !== "Escape") return;
  event.preventDefault();
  cancelTaskPlacement();
}

function renderTaskPlacementBubble() {
  if (!taskPlacement || document.querySelector(".task-placement-bubble")) return;
  const bubble = document.createElement("div");
  bubble.className = "task-placement-bubble";
  const text = document.createElement("strong");
  text.textContent = taskPlacement.text;
  const hint = document.createElement("span");
  const filed = taskPlacement.category ? `${taskPlacement.category} · ` : "";
  const wanted = taskPlacement.dueTime ? `wanted ${formatClockFromTime(taskPlacement.dueTime)} · ` : "";
  hint.textContent = `${filed}${formatEstimate(taskPlacement.minutes)} · ${wanted}click a time, Esc to cancel`;
  bubble.append(text, hint);
  if (taskPlacement.category) bubble.style.borderLeft = `4px solid ${categoryColor(taskPlacement.category)}`;
  document.body.append(bubble);
}

function updateTaskPlacementBubble(event) {
  if (!taskPlacement) return;
  renderTaskPlacementBubble();
  const bubble = document.querySelector(".task-placement-bubble");
  if (bubble) {
    bubble.style.left = `${event.clientX + 14}px`;
    bubble.style.top = `${event.clientY + 14}px`;
  }
  // Show the block that would be created, so a 30-minute task is visibly
  // 30 minutes before it is committed.
  const slot = document.elementFromPoint(event.clientX, event.clientY)?.closest?.(".calendar-slot");
  clearCalendarDraftPreview();
  if (!slot) return;
  const at = calendarTimeFromPointer(event, slot);
  if (!at) return;
  renderCalendarDraftPreview(at.date, at.minutes, at.minutes + taskPlacement.minutes, {
    label: taskPlacement.text,
    color: categoryColor(taskPlacement.category)
  });
}

// Drops the held task at the clicked time. The task itself is left alone --
// planning when to do something is not doing it, and a task that vanished into
// the calendar would stop being tickable.
function placeTaskOnCalendar(slot, event) {
  const at = calendarTimeFromPointer(event, slot);
  if (!at) return;
  const held = taskPlacement;
  const endMinutes = Math.min(at.minutes + held.minutes, CALENDAR_DAY_END_HOUR * 60);
  const placed = normalizeCalendarEvent({
    ...defaultCalendarEvent(at.date),
    id: calendarEventId(),
    taskId: held.taskId,
    deadlineId: held.deadlineId,
    title: held.text,
    start: minutesToCalendarDateTime(at.date, at.minutes),
    end: minutesToCalendarDateTime(at.date, Math.max(at.minutes + CALENDAR_SNAP_MINUTES, endMinutes)),
    kind: "plan",
    // Decided before the click, so the block is filed and coloured on landing.
    // normalizeCalendarEvent() derives the colour from the category.
    category: held.category
  });
  cancelTaskPlacement();
  if (!placed) return;
  state.calendarEvents.push(placed);
  state.calendarEvents = normalizeCalendarEvents(state.calendarEvents);
  saveCalendarEvents();
  // Placing a task on a day it is not due is a reschedule: the due date follows
  // the block, so an overdue row stops nagging once work is actually booked.
  // Same-day placement changes nothing -- an undated task stays undated.
  let rescheduled = false;
  if (held.taskId && held.sectionKey) {
    const ref = taskRef(held.sectionKey, held.taskId, held.sourceDate);
    if (ref && (ref.task.dueDate || ref.date) !== at.date) {
      updateTaskMeta(held.sectionKey, held.taskId, { dueDate: at.date }, held.sourceDate);
      rescheduled = true;
    }
  }
  render();
  if (els.saveStatus) {
    const filed = held.category ? ` (${held.category})` : "";
    const moved = rescheduled ? ` — due date moved to ${formatShortDate(at.date)}` : "";
    els.saveStatus.textContent = `Planned ${held.text}${filed} at ${formatClockFromTime(minutesToClock(at.minutes))}${moved}`;
  }
}

/* Long-press gate for touch pointers. On a phone the grid is a scroller first:
   a swipe must scroll it, a tap must stay a tap, and only a deliberate hold
   picks something up. Mouse and pen pointers never come through here.

   The touchmove blocker is registered up front and non-passive, because a
   scroll can only be vetoed by a listener that already existed when the
   gesture began -- once the hold engages it starts preventDefaulting, which is
   what lets the drag own vertical movement that would otherwise pan the view.
   Touch events keep firing on the element the touch started on however far the
   finger travels, so the blocker never needs re-homing mid-drag. The engage
   callback closes over the element rather than reading event.currentTarget,
   which is null once dispatch has finished. */
function calendarTouchHold(event, engage) {
  const target = event.currentTarget;
  const pointerId = event.pointerId;
  const startX = event.clientX;
  const startY = event.clientY;
  let engaged = false;
  const blockScroll = (touchEvent) => {
    if (engaged) touchEvent.preventDefault();
  };
  const timer = setTimeout(() => {
    engaged = true;
    target.classList.add("is-touch-held");
    engage();
  }, CALENDAR_TOUCH_HOLD_MS);
  const settle = (moveEvent) => {
    if (engaged || moveEvent.pointerId !== pointerId) return;
    if (Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) > 8) cleanup();
  };
  const cleanup = () => {
    clearTimeout(timer);
    target.classList.remove("is-touch-held");
    target.removeEventListener("touchmove", blockScroll);
    window.removeEventListener("pointermove", settle);
    window.removeEventListener("pointerup", cleanup);
    window.removeEventListener("pointercancel", cleanup);
  };
  target.addEventListener("touchmove", blockScroll, { passive: false });
  window.addEventListener("pointermove", settle);
  window.addEventListener("pointerup", cleanup);
  window.addEventListener("pointercancel", cleanup);
}

function startCalendarSlotDrag(event) {
  if (taskPlacement && event.button === 0) {
    event.preventDefault();
    placeTaskOnCalendar(event.currentTarget, event);
    return;
  }
  if (event.button !== 0 || event.target.closest("button")) return;
  const slot = event.currentTarget;
  if (event.pointerType === "touch") {
    calendarTouchHold(event, () => beginCalendarSlotDrag(slot, event));
    return;
  }
  beginCalendarSlotDrag(slot, event);
}

function beginCalendarSlotDrag(slot, event) {
  const start = calendarTimeFromPointer(event, slot);
  if (!start) return;
  calendarDragSelection = {
    date: start.date,
    startMinutes: start.minutes,
    endDate: start.date,
    endMinutes: Math.min(start.minutes + 60, CALENDAR_DAY_END_HOUR * 60),
    didMove: false
  };
  // The pointer can be gone by the time a long-press engages (cancelled on the
  // same tick the hold timer fired); losing capture is fine, losing the
  // listeners below to the throw is not.
  try {
    slot.setPointerCapture?.(event.pointerId);
  } catch {
    /* stale pointer */
  }
  updateDragSelectionHighlights();
  window.addEventListener("pointermove", updateCalendarSlotDrag);
  window.addEventListener("pointerup", finishCalendarSlotDrag, { once: true });
  window.addEventListener("pointercancel", cancelCalendarSlotDrag, { once: true });
}

// A cancelled pointer (iOS reclaiming the gesture, an incoming call) must not
// open the editor the way a release would -- the selection just goes away.
function cancelCalendarSlotDrag() {
  if (!calendarDragSelection) return;
  calendarDragSelection = null;
  window.removeEventListener("pointermove", updateCalendarSlotDrag);
  window.removeEventListener("pointerup", finishCalendarSlotDrag);
  updateDragSelectionHighlights();
}

function updateCalendarSlotDrag(event) {
  if (!calendarDragSelection) return;
  // Any day column will do: dragging sideways into a neighbouring day extends
  // the selection across days instead of being ignored.
  const next = calendarDragPointAt(event.clientX, event.clientY);
  if (!next) return;
  calendarDragSelection.didMove = true;
  calendarDragSelection.endDate = next.date;
  calendarDragSelection.endMinutes = next.minutes;
  updateDragSelectionHighlights();
}

/* Where a drag pointer is, by column geometry rather than by what element is
   under it: elementFromPoint lands on whatever the pointer crosses -- an event
   block, its resize handle, the now line -- and a create-drag that only
   listened to bare slots froze whenever it passed over one of those. */
function calendarDragPointAt(x, y) {
  for (const column of document.querySelectorAll(".calendar-grid-day")) {
    const rect = column.getBoundingClientRect();
    if (x < rect.left || x >= rect.right) continue;
    const totalMinutes = (CALENDAR_DAY_END_HOUR - CALENDAR_DAY_START_HOUR) * 60;
    const raw = CALENDAR_DAY_START_HOUR * 60 + ((y - rect.top) / Math.max(1, rect.height)) * totalMinutes;
    const snapped = Math.round(raw / CALENDAR_SNAP_MINUTES) * CALENDAR_SNAP_MINUTES;
    return { date: column.dataset.date, minutes: clampCalendarMinutes(snapped) };
  }
  // The legacy slot layout has no .calendar-grid-day columns to measure.
  const slot = document.elementFromPoint(x, y)?.closest?.(".calendar-slot");
  if (!slot) return null;
  return calendarTimeFromPointer({ clientY: y }, slot);
}

// The two ends of a drag selection in chronological order, since a drag can
// run backwards in time (up, or into an earlier day) as easily as forwards.
function orderedDragSelection(selection) {
  const anchor = calendarDateToDayIndex(selection.date) * 1440 + selection.startMinutes;
  const head = calendarDateToDayIndex(selection.endDate || selection.date) * 1440 + selection.endMinutes;
  if (head >= anchor) {
    return { startDate: selection.date, startMinutes: selection.startMinutes, endDate: selection.endDate || selection.date, endMinutes: selection.endMinutes };
  }
  return { startDate: selection.endDate || selection.date, startMinutes: selection.endMinutes, endDate: selection.date, endMinutes: selection.startMinutes };
}

function finishCalendarSlotDrag() {
  if (!calendarDragSelection) return;
  const selection = calendarDragSelection;
  window.removeEventListener("pointermove", updateCalendarSlotDrag);
  window.removeEventListener("pointercancel", cancelCalendarSlotDrag);
  const ordered = orderedDragSelection(selection);
  let startMinutes = ordered.startMinutes;
  let endMinutes = ordered.endMinutes;
  if (ordered.startDate === ordered.endDate) {
    if (endMinutes <= startMinutes) endMinutes = startMinutes + CALENDAR_SNAP_MINUTES;
    if (endMinutes > CALENDAR_DAY_END_HOUR * 60) {
      endMinutes = CALENDAR_DAY_END_HOUR * 60;
      startMinutes = Math.min(startMinutes, endMinutes - CALENDAR_SNAP_MINUTES);
    }
    endMinutes = Math.max(startMinutes + CALENDAR_SNAP_MINUTES, endMinutes);
  }
  const start = minutesToCalendarDateTime(ordered.startDate, startMinutes);
  const end = minutesToCalendarDateTime(ordered.endDate, endMinutes);
  calendarDragSelection = null;
  openCalendarEditor(ordered.startDate, {
    title: "",
    start,
    end,
    kind: defaultCalendarKind()
  });
}

function updateDragSelectionHighlights() {
  document.querySelectorAll(".calendar-slot.is-selected").forEach((slot) => slot.classList.remove("is-selected"));
  clearCalendarDraftPreview();
  if (!calendarDragSelection) return;
  const ordered = orderedDragSelection(calendarDragSelection);
  // One highlight-and-preview pass per day the selection touches; each day
  // sees only its own clip of the range.
  for (let date = ordered.startDate; date <= ordered.endDate; date = shiftISODate(date, 1)) {
    const dayStart = date === ordered.startDate ? ordered.startMinutes : 0;
    const dayEnd = date === ordered.endDate ? ordered.endMinutes : 1440;
    // A selection that ends exactly at midnight owns none of its final day.
    if (date !== ordered.startDate && dayEnd === 0) break;
    document.querySelectorAll(`.calendar-slot[data-date="${date}"]`).forEach((slot) => {
      const slotStart = Number(slot.dataset.hour) * 60;
      const slotEnd = slotStart + 60;
      slot.classList.toggle("is-selected", slotEnd > dayStart && slotStart < dayEnd);
    });
    renderCalendarDraftPreview(date, dayStart, Math.max(dayStart + CALENDAR_SNAP_MINUTES, dayEnd));
  }
}

function clearCalendarDraftPreview() {
  document.querySelectorAll(".calendar-draft-preview").forEach((preview) => preview.remove());
}

function renderPersistentDraftPreview() {
  if (!calendarPersistentDraftPreview) return;
  requestAnimationFrame(() => {
    if (!calendarPersistentDraftPreview || editingCalendarEventId !== "new") return;
    clearCalendarDraftPreview();
    // One clip per day the draft touches, so a multi-day draft shows on every
    // column it will occupy; a day it only touches at midnight draws nothing.
    const startDate = calendarPersistentDraftPreview.start.slice(0, 10);
    const endDate = calendarPersistentDraftPreview.end.slice(0, 10);
    const startMinutes = calendarDateTimeToMinutes(calendarPersistentDraftPreview.start);
    const endMinutes = calendarDateTimeToMinutes(calendarPersistentDraftPreview.end);
    for (let date = startDate; date <= endDate; date = shiftISODate(date, 1)) {
      const dayStart = date === startDate ? startMinutes : 0;
      const dayEnd = date === endDate ? endMinutes : 1440;
      if (date !== startDate && dayEnd === 0) break;
      renderCalendarDraftPreview(date, dayStart, dayEnd, { persistent: true });
    }
  });
}

function renderCalendarDraftPreview(date, startMinutes, endMinutes, options = {}) {
  const gridColumn = document.querySelector(`.calendar-grid-day[data-date="${date}"]`);
  const legacySlots = document.querySelector(`.calendar-slot[data-date="${date}"]`)?.closest(".calendar-slots");
  const target = gridColumn || legacySlots;
  if (!target) return;
  const totalMinutes = (CALENDAR_DAY_END_HOUR - CALENDAR_DAY_START_HOUR) * 60;
  const topPercent = ((startMinutes - CALENDAR_DAY_START_HOUR * 60) / totalMinutes) * 100;
  const heightPercent = ((endMinutes - startMinutes) / totalMinutes) * 100;
  const preview = document.createElement("div");
  preview.className = "calendar-draft-preview";
  preview.classList.toggle("is-persistent", Boolean(options.persistent));
  // A held task already knows its category, so the preview is the colour the
  // committed block will be.
  if (options.color) preview.style.setProperty("--draft-accent", options.color);
  preview.style.top = `${Math.max(0, topPercent)}%`;
  preview.style.height = `max(22px, ${Math.max(0, heightPercent)}%)`;
  const label = document.createElement("strong");
  label.textContent = options.label || "New event";
  const time = document.createElement("span");
  time.textContent = `${formatClockFromTime(minutesToClock(startMinutes))} - ${formatClockFromTime(minutesToClock(endMinutes))}`;
  preview.append(label, time);
  target.append(preview);
}

function calendarTimeFromPointer(event, slot) {
  const rect = slot.getBoundingClientRect();
  const hour = Number(slot.dataset.hour);
  const rawMinutes = hour * 60 + ((event.clientY - rect.top) / Math.max(1, rect.height)) * 60;
  const snapped = Math.round(rawMinutes / CALENDAR_SNAP_MINUTES) * CALENDAR_SNAP_MINUTES;
  return {
    date: slot.dataset.date,
    minutes: clampCalendarMinutes(snapped)
  };
}

function clampCalendarMinutes(minutes) {
  const min = CALENDAR_DAY_START_HOUR * 60;
  const max = CALENDAR_DAY_END_HOUR * 60;
  return Math.min(max, Math.max(min, minutes));
}

function minutesToCalendarDateTime(date, minutes) {
  const clamped = clampCalendarMinutes(minutes);
  // Midnight at the end of the day is next-day 00:00, never 24:00 -- the
  // editor's <input type="time"> cannot show 24:00 and renders blank.
  if (clamped === 1440) return `${shiftISODate(date, 1)}T00:00`;
  return `${date}T${minutesToClock(clamped)}`;
}

function minutesToClock(minutes) {
  const clamped = clampCalendarMinutes(minutes);
  const hour = Math.floor(clamped / 60);
  const minute = clamped % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

const CALENDAR_EPOCH_DATE = "1970-01-01";

// Pure string -> integer, and the hottest thing in the calendar: every test of
// whether an event touches a day parses two dates through it, so one day view
// over a year of events ran thousands of Date constructions. Cached by the ISO
// string, which is the whole input -- there is nothing to invalidate.
const calendarDayIndexCache = new Map();

function calendarDateToDayIndex(date) {
  const cached = calendarDayIndexCache.get(date);
  if (cached !== undefined) return cached;
  const index = Math.round((dateFromISO(date) - dateFromISO(CALENDAR_EPOCH_DATE)) / 86400000);
  calendarDayIndexCache.set(date, index);
  return index;
}

// The inverse, memoized for the same reason: filing an event and reading a
// block's clock back out both go through here.
const calendarDayDateCache = new Map();

function calendarDayIndexToDate(dayIndex) {
  const cached = calendarDayDateCache.get(dayIndex);
  if (cached !== undefined) return cached;
  const date = shiftISODate(CALENDAR_EPOCH_DATE, dayIndex);
  calendarDayDateCache.set(dayIndex, date);
  return date;
}

function calendarDateTimeToAbsoluteMinutes(value) {
  const [date = todayISO()] = String(value || "").split("T");
  return calendarDateToDayIndex(date) * 1440 + calendarDateTimeToMinutes(value);
}

function absoluteMinutesToCalendarDateTime(absoluteMinutes) {
  const snapped = Math.round(Number(absoluteMinutes || 0));
  const dayIndex = Math.floor(snapped / 1440);
  const minutes = ((snapped % 1440) + 1440) % 1440;
  return `${calendarDayIndexToDate(dayIndex)}T${minutesToClock(minutes)}`;
}

function calendarEventSourceStart(event) {
  return event.sourceStart || event.start;
}

function calendarEventSourceEnd(event) {
  return event.sourceEnd || event.end;
}

function calendarEventStartMinutes(event) {
  return Number.isFinite(event.displayStartMinutes) ? event.displayStartMinutes : calendarDateTimeToMinutes(event.start);
}

function calendarEventEndMinutes(event) {
  return Number.isFinite(event.displayEndMinutes) ? event.displayEndMinutes : calendarDateTimeToMinutes(event.end);
}

function calendarColumnFromPointer(event, fallbackDate = "") {
  const direct = document.elementFromPoint(event.clientX, event.clientY)?.closest?.(".calendar-grid-day");
  if (direct) return direct;
  const columns = [...document.querySelectorAll(".calendar-grid-day")];
  const xMatch = columns.find((column) => {
    const rect = column.getBoundingClientRect();
    return event.clientX >= rect.left && event.clientX <= rect.right;
  });
  if (xMatch) return xMatch;
  if (fallbackDate) return document.querySelector(`.calendar-grid-day[data-date="${fallbackDate}"]`);
  return null;
}

function calendarPointerAbsoluteMinutes(event, fallbackDate = "") {
  const column = calendarColumnFromPointer(event, fallbackDate);
  if (!column) return null;
  const minutes = calendarMinutesFromColumnPointer(event, column);
  if (minutes == null) return null;
  const snapped = Math.round(minutes / CALENDAR_SNAP_MINUTES) * CALENDAR_SNAP_MINUTES;
  return {
    column,
    date: column.dataset.date,
    minutes: clampCalendarMinutes(snapped),
    absoluteMinutes: calendarDateToDayIndex(column.dataset.date) * 1440 + clampCalendarMinutes(snapped)
  };
}

function startCalendarEventMove(event, calendarEvent) {
  if (event.button !== 0 || event.target.closest(".calendar-resize-handle")) return;
  const block = event.currentTarget;
  // Touch scrolls or taps until held: an immediate grab here (plus the old
  // touch-action:none) made every block a dead spot for scrolling, and a full
  // day of blocks left the phone calendar unscrollable.
  if (event.pointerType === "touch") {
    calendarTouchHold(event, () => beginCalendarEventMove(block, event, calendarEvent));
    return;
  }
  beginCalendarEventMove(block, event, calendarEvent);
}

function beginCalendarEventMove(block, event, calendarEvent) {
  event.preventDefault();
  const column = block.closest(".calendar-grid-day");
  const source = state.calendarEvents.find((item) => item.id === calendarEvent.id);
  if (isSyncedCalendarEvent(source)) return;
  const pointer = calendarPointerAbsoluteMinutes(event, column?.dataset.date || calendarEvent.occurrenceDate || calendarEvent.start.slice(0, 10));
  if (!column || !source || !pointer) return;
  const startAbsolute = calendarDateTimeToAbsoluteMinutes(calendarEventSourceStart(calendarEvent));
  const endAbsolute = Math.max(startAbsolute + CALENDAR_SNAP_MINUTES, calendarDateTimeToAbsoluteMinutes(calendarEventSourceEnd(calendarEvent)));
  const occurrenceDate = calendarEvent.occurrenceDate || calendarEvent.start.slice(0, 10);
  // What this block actually draws: the event clipped to the day it is on. For
  // anything inside one day that is the event itself; for an overnight block it
  // is the half the pointer has hold of.
  const segmentDayStart = calendarDateToDayIndex(occurrenceDate) * 1440;
  calendarEventMoveState = {
    eventId: source.id,
    block,
    slots: column,
    date: pointer.date,
    pointerStartAbsolute: pointer.absoluteMinutes,
    startAbsolute,
    endAbsolute,
    segmentStartAbsolute: segmentDayStart + calendarEventStartMinutes(calendarEvent),
    segmentEndAbsolute: segmentDayStart + calendarEventEndMinutes(calendarEvent),
    // The drag is carried as a snap-quantised offset and only becomes times on
    // drop, so nothing on the record moves while the pointer is down.
    delta: 0,
    paintedDelta: null,
    timeLabelSuffix: calendarBlockTimeSuffix(block),
    didMove: false,
    recurring: Boolean(source.recurrence && source.recurrence !== "none"),
    occurrenceDate
  };
  // Same stale-pointer guard as beginCalendarSlotDrag: capture is optional,
  // the listeners are not.
  try {
    block.setPointerCapture?.(event.pointerId);
  } catch {
    /* stale pointer */
  }
  window.addEventListener("pointermove", updateCalendarEventMove);
  window.addEventListener("pointerup", finishCalendarEventMove, { once: true });
  window.addEventListener("pointercancel", cancelCalendarEventMove, { once: true });
}

// A cancelled pointer mid-move puts the block back where it started instead of
// committing wherever the drag preview happened to be. Nothing was written to
// the event, so a re-render is the whole of the undo.
function cancelCalendarEventMove() {
  if (!calendarEventMoveState) return;
  const moveState = calendarEventMoveState;
  calendarEventMoveState = null;
  window.removeEventListener("pointermove", updateCalendarEventMove);
  window.removeEventListener("pointerup", finishCalendarEventMove);
  moveState.block?.classList.remove("is-dragging");
  if (!moveState.didMove) return;
  renderCalendarView();
}

/* --- Dragging a block -------------------------------------------------------

   A drag moves the block, not the calendar. This used to write the new times
   onto the event and call renderCalendarView() on every pointermove, which
   emptied and rebuilt the entire view -- toolbar, mini row, every day column,
   every block, then a text-fit pass that measures all of them. On an ordinary
   week that render was ~165ms, so a drag repainted at about six frames a
   second and the block crawled behind the pointer.

   The preview is now a handful of style writes on the one block being dragged,
   and the times reach the event once, on drop. What is given up is that the
   overlap cascade no longer reflows under the pointer: the dragged block floats
   above its neighbours until it lands and the drop's render settles the stack.
   That is how a dragged block behaves in every other calendar, and it is the
   difference between six frames a second and the pointer.
---------------------------------------------------------------------------- */

function updateCalendarEventMove(event) {
  if (!calendarEventMoveState) return;
  const pointer = calendarPointerAbsoluteMinutes(event, calendarEventMoveState.date);
  if (!pointer) return;
  const rawDelta = pointer.absoluteMinutes - calendarEventMoveState.pointerStartAbsolute;
  const snappedDelta = Math.round(rawDelta / CALENDAR_SNAP_MINUTES) * CALENDAR_SNAP_MINUTES;
  if (!calendarEventMoveState.didMove && Math.abs(snappedDelta) < CALENDAR_SNAP_MINUTES) return;
  if (!calendarEventMoveState.didMove) markCalendarBlockDragging(calendarEventMoveState.block);
  calendarEventMoveState.date = pointer.date;
  calendarEventMoveState.didMove = true;
  calendarEventMoveState.delta = snappedDelta;
  if (calendarEventMoveState.paintedDelta === snappedDelta) return;
  calendarEventMoveState.paintedDelta = snappedDelta;
  const times = calendarEventMoveTimes(calendarEventMoveState);
  paintCalendarBlockRange(
    calendarEventMoveState.block,
    times.startAbsolute,
    times.endAbsolute,
    calendarEventMoveState.timeLabelSuffix,
    // The segment travels with the block, so the drag keeps hold of the half it
    // picked up rather than jumping to the day the whole event starts on.
    {
      startAbsolute: calendarEventMoveState.segmentStartAbsolute + calendarEventMoveState.delta,
      endAbsolute: calendarEventMoveState.segmentEndAbsolute + calendarEventMoveState.delta
    }
  );
}

// Where the drag says the event is now. A move keeps its duration, so only the
// start actually travels.
function calendarEventMoveTimes(moveState) {
  const duration = Math.max(CALENDAR_SNAP_MINUTES, moveState.endAbsolute - moveState.startAbsolute);
  const startAbsolute = moveState.startAbsolute + moveState.delta;
  return { startAbsolute, endAbsolute: startAbsolute + duration };
}

/* Puts one block where a live drag says it is: its day's column, its top, its
   height, and the time it currently reads. Deliberately touches nothing else
   on the grid -- that is the point of it.

   A block is one day of an event, not the whole of it: an event running past
   midnight is drawn as a segment per column, so the morning half of a sleep
   block sits on today's column while the event itself started yesterday
   evening. `segment` is the dragged range clipped to the day this block is
   drawn on, and it is what the geometry is painted from; the time row still
   reads the event's whole span. Painting straight from the event's start is
   what used to make an overnight block disappear the moment it was grabbed --
   it re-parented itself into yesterday's column, and when that column was not
   on screen it slid to the foot of its own. */
function paintCalendarBlockRange(block, startAbsolute, endAbsolute, timeSuffix, segment = null) {
  if (!block?.isConnected) return;
  const totalMinutes = (CALENDAR_DAY_END_HOUR - CALENDAR_DAY_START_HOUR) * 60;
  const spanStart = segment ? segment.startAbsolute : startAbsolute;
  const spanEnd = segment ? segment.endAbsolute : endAbsolute;
  const dayIndex = Math.floor(spanStart / 1440);
  const date = calendarDayIndexToDate(dayIndex);
  if (block.parentElement?.dataset?.date !== date) {
    // Dragged off the end of the visible range: leave the block in the column
    // it is in and let the drop's render put it on the day it landed on.
    const column = document.querySelector(`.calendar-grid-day[data-date="${date}"]`);
    if (column) column.append(block);
  }
  const startMinutes = spanStart - dayIndex * 1440;
  // Clipped at the foot of the column the way the render clips it: whatever
  // runs past midnight belongs to the next day's block, not to this one.
  const endMinutes = Math.min(
    CALENDAR_DAY_END_HOUR * 60,
    Math.max(startMinutes + CALENDAR_SNAP_MINUTES, spanEnd - dayIndex * 1440)
  );
  block.style.top = `${((startMinutes - CALENDAR_DAY_START_HOUR * 60) / totalMinutes) * 100}%`;
  block.style.height = `max(22px, ${((endMinutes - startMinutes) / totalMinutes) * 100}%)`;
  if (timeSuffix == null) return;
  // The block is the only readout of where the drag has got to, so its time row
  // tracks the pointer; everything after the time in that row is unchanged.
  const time = block.querySelector("span:not(.calendar-resize-handle)");
  if (!time) return;
  const label = calendarEventTimeLabel({
    start: absoluteMinutesToCalendarDateTime(startAbsolute),
    end: absoluteMinutesToCalendarDateTime(endAbsolute)
  });
  time.textContent = [label, timeSuffix].filter(Boolean).join(" · ");
}

/* Lifts a block out of the overlap stack for the length of a drag. The z-index
   has to be written inline: calendarEventBlock sets one there from the layout
   depth, and an inline value beats any class rule. Nothing puts it back, and
   nothing needs to -- every way a drag ends re-renders the grid. */
function markCalendarBlockDragging(block) {
  if (!block) return;
  block.classList.add("is-dragging");
  block.style.zIndex = "30";
}

// The non-time half of a block's time row ("plan · fyi · Google" and the like),
// kept so a drag can rewrite the clock without rebuilding the chip.
function calendarBlockTimeSuffix(block) {
  const time = block?.querySelector?.("span:not(.calendar-resize-handle)");
  return String(time?.textContent || "").split(" · ").slice(1).join(" · ");
}

function finishCalendarEventMove() {
  if (!calendarEventMoveState) return;
  const moveState = calendarEventMoveState;
  calendarEventMoveState = null;
  window.removeEventListener("pointermove", updateCalendarEventMove);
  window.removeEventListener("pointercancel", cancelCalendarEventMove);
  moveState.block?.classList.remove("is-dragging");
  if (!moveState.didMove) return;
  calendarSuppressEventClickId = moveState.eventId;
  const source = state.calendarEvents.find((item) => item.id === moveState.eventId);
  if (!source) {
    render();
    return;
  }
  const times = calendarEventMoveTimes(moveState);
  const nextStart = absoluteMinutesToCalendarDateTime(times.startAbsolute);
  const nextEnd = absoluteMinutesToCalendarDateTime(times.endAbsolute);
  if (moveState.recurring) {
    // The preview never touched the record, so the series is still holding the
    // occurrence's original times while the scope question is answered.
    render();
    promptRecurringDragScope(source.id, moveState.occurrenceDate, nextStart, nextEnd);
    return;
  }
  source.start = nextStart;
  source.end = nextEnd;
  state.calendarEvents = normalizeCalendarEvents(state.calendarEvents);
  saveCalendarEvents();
  // The block is the schedule: a pegged task follows it to the new day.
  followPeggedTaskDueDate(moveState.eventId);
  render();
}

function startCalendarEventResize(event, calendarEvent, edge = "bottom") {
  event.preventDefault();
  event.stopPropagation();
  const column = event.currentTarget.closest(".calendar-grid-day");
  const slots = column || event.currentTarget.closest(".calendar-day-column")?.querySelector(".calendar-slots");
  const source = state.calendarEvents.find((item) => item.id === calendarEvent.id);
  if (isSyncedCalendarEvent(source)) return;
  if (!slots || !source) return;
  const date = calendarEvent.occurrenceDate || calendarEvent.start.slice(0, 10);
  const pointer = calendarPointerAbsoluteMinutes(event, date);
  const block = event.currentTarget.closest(".calendar-event-block");
  const startAbsolute = calendarDateTimeToAbsoluteMinutes(calendarEventSourceStart(calendarEvent));
  const endAbsolute = Math.max(startAbsolute + CALENDAR_SNAP_MINUTES, calendarDateTimeToAbsoluteMinutes(calendarEventSourceEnd(calendarEvent)));
  calendarResizeState = {
    eventId: source.id,
    block,
    slots,
    date,
    // The day this block is drawn on. `date` follows the pointer into whatever
    // column it wanders over; this does not, because the block being resized
    // stays the occurrence that was grabbed.
    displayDate: date,
    edge,
    calendarEvent,
    didResize: false,
    recurring: Boolean(source.recurrence && source.recurrence !== "none"),
    pointerStartAbsolute: pointer ? pointer.absoluteMinutes : null,
    start: calendarEventSourceStart(calendarEvent),
    end: calendarEventSourceEnd(calendarEvent),
    startAbsolute,
    endAbsolute,
    // Same as a move: the drag is previewed on the block and only the dragged
    // edge is written to the event, once, on release.
    previewStartAbsolute: startAbsolute,
    previewEndAbsolute: endAbsolute,
    paintedEdge: null,
    timeLabelSuffix: calendarBlockTimeSuffix(block)
  };
  // Same stale-pointer guard as beginCalendarEventMove: without the capture, a
  // button released outside the window never delivers its pointerup and the
  // block goes on resizing with nothing held down.
  try {
    block?.setPointerCapture?.(event.pointerId);
  } catch {
    /* stale pointer */
  }
  window.addEventListener("pointermove", updateCalendarEventResize);
  window.addEventListener("pointerup", finishCalendarEventResize, { once: true });
  window.addEventListener("pointercancel", cancelCalendarEventResize, { once: true });
}

// A cancelled pointer mid-resize puts the block back at its stored length
// instead of leaving the preview standing. Nothing was written to the event, so
// a re-render is the whole of the undo.
function cancelCalendarEventResize() {
  if (!calendarResizeState) return;
  const resizeState = calendarResizeState;
  calendarResizeState = null;
  window.removeEventListener("pointermove", updateCalendarEventResize);
  window.removeEventListener("pointerup", finishCalendarEventResize);
  resizeState.block?.classList.remove("is-dragging");
  if (!resizeState.didResize) return;
  renderCalendarView();
}

function updateCalendarEventResize(event) {
  if (!calendarResizeState) return;
  const pointer = calendarPointerAbsoluteMinutes(event, calendarResizeState.date);
  if (!pointer) return;
  if (!calendarResizeState.didResize) {
    if (calendarResizeState.pointerStartAbsolute != null
      && Math.abs(pointer.absoluteMinutes - calendarResizeState.pointerStartAbsolute) < CALENDAR_SNAP_MINUTES) return;
    markCalendarBlockDragging(calendarResizeState.block);
    calendarResizeState.didResize = true;
  }
  calendarResizeState.date = pointer.date;
  // An edge never crosses the one it is not dragging: a block keeps at least
  // one snap of length however far the pointer is pulled past the other end.
  const edgeAbsolute = calendarResizeState.edge === "top"
    ? Math.min(calendarResizeState.endAbsolute - CALENDAR_SNAP_MINUTES, pointer.absoluteMinutes)
    : Math.max(calendarResizeState.startAbsolute + CALENDAR_SNAP_MINUTES, pointer.absoluteMinutes);
  if (calendarResizeState.paintedEdge === edgeAbsolute) return;
  calendarResizeState.paintedEdge = edgeAbsolute;
  if (calendarResizeState.edge === "top") calendarResizeState.previewStartAbsolute = edgeAbsolute;
  else calendarResizeState.previewEndAbsolute = edgeAbsolute;
  const dayStart = calendarDateToDayIndex(calendarResizeState.displayDate) * 1440;
  paintCalendarBlockRange(
    calendarResizeState.block,
    calendarResizeState.previewStartAbsolute,
    calendarResizeState.previewEndAbsolute,
    calendarResizeState.timeLabelSuffix,
    // Only the part of the drag that falls inside this column is this block's
    // to draw; the rest of an overnight event is the neighbouring day's block.
    {
      startAbsolute: Math.min(dayStart + 1440 - CALENDAR_SNAP_MINUTES, Math.max(dayStart, calendarResizeState.previewStartAbsolute)),
      endAbsolute: Math.min(dayStart + 1440, calendarResizeState.previewEndAbsolute)
    }
  );
}

function finishCalendarEventResize() {
  if (!calendarResizeState) return;
  const resizeState = calendarResizeState;
  calendarResizeState = null;
  window.removeEventListener("pointermove", updateCalendarEventResize);
  window.removeEventListener("pointercancel", cancelCalendarEventResize);
  resizeState.block?.classList.remove("is-dragging");
  if (!resizeState.didResize) {
    openCalendarEventEditor(resizeState.calendarEvent);
    return;
  }
  const source = state.calendarEvents.find((item) => item.id === resizeState.eventId);
  if (!source) {
    render();
    return;
  }
  // Only the dragged edge moved; the other keeps the occurrence's own time
  // from the snapshot taken when the handle was grabbed.
  const nextStart = absoluteMinutesToCalendarDateTime(resizeState.previewStartAbsolute);
  const nextEnd = absoluteMinutesToCalendarDateTime(resizeState.previewEndAbsolute);
  if (resizeState.recurring) {
    // The preview never touched the record, so the series still holds the
    // occurrence's original times while the scope question is answered.
    render();
    promptRecurringDragScope(source.id, resizeState.displayDate, nextStart, nextEnd);
    return;
  }
  source.start = nextStart;
  source.end = nextEnd;
  state.calendarEvents = normalizeCalendarEvents(state.calendarEvents);
  saveCalendarEvents();
  render();
}

// After a drag or resize on a repeating event, ask the same question the
// editor asks on save: change just this day, or the series from here onward.
// The series is re-found by id when a button is clicked: render() rebuilds
// every event object, so a reference captured now would be stale by then.
function promptRecurringDragScope(seriesId, occurrenceDate, nextStart, nextEnd) {
  document.querySelector(".calendar-scope-backdrop")?.remove();
  const overlay = document.createElement("div");
  overlay.className = "calendar-scope-backdrop";
  const card = document.createElement("div");
  card.className = "calendar-scope-card";
  const heading = document.createElement("strong");
  heading.textContent = "This is a repeating event";
  const detail = document.createElement("span");
  detail.className = "calendar-scope-detail";
  detail.textContent = `Move to ${calendarEditorTimeSummary(nextStart.slice(0, 10), nextStart.slice(11, 16), nextEnd.slice(11, 16))}?`;
  // The detached occurrence and the split successor are new records, so the
  // follow is told which one to read rather than assuming the series id.
  const finish = (movedEventId = seriesId) => {
    overlay.remove();
    state.calendarEvents = normalizeCalendarEvents(state.calendarEvents);
    saveCalendarEvents();
    followPeggedTaskDueDate(movedEventId);
    render();
  };
  const thisEvent = document.createElement("button");
  thisEvent.type = "button";
  thisEvent.textContent = "This event";
  thisEvent.addEventListener("click", () => {
    const series = state.calendarEvents.find((event) => event.id === seriesId);
    const detached = series ? detachRecurringOccurrence(series, occurrenceDate, { start: nextStart, end: nextEnd }) : null;
    finish(detached?.id || seriesId);
  });
  const following = document.createElement("button");
  following.type = "button";
  following.textContent = "This and following events";
  following.addEventListener("click", () => {
    const series = state.calendarEvents.find((event) => event.id === seriesId);
    if (!series) {
      finish();
      return;
    }
    const overrides = { start: nextStart, end: nextEnd };
    if (series.recurrence === "weekly" && series.repeatDays?.length) {
      // Dragging Wednesday's occurrence to Thursday moves that weekday slot
      // for the successor series, not just this one day.
      const fromDay = dateFromISO(occurrenceDate).getDay();
      const toDay = dateFromISO(nextStart.slice(0, 10)).getDay();
      if (fromDay !== toDay) {
        overrides.repeatDays = [...new Set(series.repeatDays.map((day) => (day === fromDay ? toDay : day)))].sort((a, b) => a - b);
      }
    }
    const successor = splitRecurringSeriesAt(series, occurrenceDate, overrides);
    finish(successor?.id || seriesId);
  });
  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "quiet";
  cancel.textContent = "Cancel";
  cancel.addEventListener("click", () => overlay.remove());
  card.append(heading, detail, thisEvent, following, cancel);
  overlay.append(card);
  document.body.append(overlay);
}

function calendarMinutesFromColumnPointer(event, column) {
  const rect = column.getBoundingClientRect();
  const totalMinutes = (CALENDAR_DAY_END_HOUR - CALENDAR_DAY_START_HOUR) * 60;
  const rawMinutes = CALENDAR_DAY_START_HOUR * 60 + ((event.clientY - rect.top) / Math.max(1, rect.height)) * totalMinutes;
  return clampCalendarMinutes(rawMinutes);
}

function liveCalendarResizeSlots(resizeState) {
  const column = document.querySelector(`.calendar-grid-day[data-date="${resizeState.date}"]`);
  if (column) {
    resizeState.slots = column;
    return column;
  }
  if (resizeState.slots?.isConnected) return resizeState.slots;
  return null;
}

function calendarDateTimeToMinutes(value) {
  const [, time = "00:00"] = String(value || "").split("T");
  const [hour, minute] = time.split(":").map(Number);
  return (hour || 0) * 60 + (minute || 0);
}

/* --- The day index ----------------------------------------------------------

   Asking "what is on this day" used to read the whole stored history and test
   every event, so a week digest walked sixteen thousand events to show a
   hundred. A dated event only ever answers for the days it spans, so it is
   filed under those days once and looked up thereafter.

   Two kinds of event cannot be filed. A repeat has no last day to file it
   under, and an event spanning an implausible stretch of calendar would fill
   the map with thousands of entries on its own. Both go in a scanned list and
   keep the original test, which is why eventTouchesDate is still the authority
   on what touches what -- the index has to agree with it, so the arithmetic
   below is that function's two comparisons solved for the day number.

   The list of events is the version marker: every path that edits one rebuilds
   state.calendarEvents through normalizeCalendarEvents, so a change of array
   means a stale index. The length is checked too, to catch a bare push.
---------------------------------------------------------------------------- */

const CALENDAR_INDEX_MAX_SPAN_DAYS = 62;

let calendarIndexSource = null;
let calendarIndexLength = -1;
let calendarEventsByDate = new Map();
let calendarUnindexedEvents = [];

function calendarDayIndex() {
  if (calendarIndexSource === state.calendarEvents && calendarIndexLength === state.calendarEvents.length) {
    return calendarEventsByDate;
  }
  calendarEventsByDate = new Map();
  calendarUnindexedEvents = [];
  for (const event of state.calendarEvents) {
    if (event.recurrence && event.recurrence !== "none") {
      calendarUnindexedEvents.push(event);
      continue;
    }
    const eventStart = calendarDateTimeToAbsoluteMinutes(event.start);
    const eventEnd = Math.max(eventStart + CALENDAR_SNAP_MINUTES, calendarDateTimeToAbsoluteMinutes(event.end));
    // eventTouchesDate keeps the day's end exclusive and its start exclusive of
    // the event's end, so a block finishing exactly at midnight belongs to the
    // day it ran through and not to the one it touches for zero minutes.
    const firstDay = Math.floor(eventStart / 1440);
    const lastDay = Math.floor((eventEnd - 1) / 1440);
    if (lastDay - firstDay > CALENDAR_INDEX_MAX_SPAN_DAYS) {
      calendarUnindexedEvents.push(event);
      continue;
    }
    for (let day = firstDay; day <= lastDay; day += 1) {
      const key = calendarDayIndexToDate(day);
      const bucket = calendarEventsByDate.get(key);
      if (bucket) bucket.push(event);
      else calendarEventsByDate.set(key, [event]);
    }
  }
  calendarIndexSource = state.calendarEvents;
  calendarIndexLength = state.calendarEvents.length;
  return calendarEventsByDate;
}

function eventsForDay(date) {
  ensureCalendarState();
  const filed = calendarDayIndex().get(date) || [];
  // Occurrences stay freshly built per call: callers treat them as their own
  // and edit them in place, so the index holds stored events, never these.
  return [...filed, ...calendarUnindexedEvents.filter((event) => eventTouchesDate(event, date))]
    .map((event) => eventOccurrenceForDate(event, date))
    .sort(compareCalendarEvents);
}

function visibleCalendarEventsForDay(date) {
  return eventsForDay(date).filter(calendarEventVisible);
}

function calendarEventVisible(event) {
  // A deadline is a fact about the world, not a plan or a record of one, so it
  // ignores the plan/actual filter: whichever half of the day is on screen,
  // the due line stays.
  if (event.kind === "deadline") return true;
  if (event.tentative && !calendarShowTentative) return false;
  return calendarKindFilter === "both" || event.kind === calendarKindFilter;
}

function eventTouchesDate(event, date) {
  if (event.recurrence && event.recurrence !== "none") return recurringEventTouchesDate(event, date);
  const dayStart = calendarDateToDayIndex(date) * 1440;
  const dayEnd = dayStart + 1440;
  const eventStart = calendarDateTimeToAbsoluteMinutes(event.start);
  const eventEnd = Math.max(eventStart + CALENDAR_SNAP_MINUTES, calendarDateTimeToAbsoluteMinutes(event.end));
  return eventStart < dayEnd && eventEnd > dayStart;
}

function recurringEventTouchesDate(event, date) {
  const startDate = event.start.slice(0, 10);
  if (date < startDate) return false;
  if (event.recurrenceEndDate && date >= event.recurrenceEndDate) return false;
  if (event.exceptionDates?.includes(date)) return false;
  const source = dateFromISO(startDate);
  const target = dateFromISO(date);
  const days = Math.round((target - source) / 86400000);
  if (event.recurrence === "daily") return days >= 0;
  if (event.recurrence === "weekly") {
    const repeatDays = event.repeatDays?.length ? event.repeatDays : [source.getDay()];
    return days >= 0 && repeatDays.includes(target.getDay());
  }
  if (event.recurrence === "monthly") return date.slice(8, 10) === startDate.slice(8, 10);
  return false;
}

function eventOccurrenceForDate(event, date) {
  if (!event.recurrence || event.recurrence === "none") {
    const dayStart = calendarDateToDayIndex(date) * 1440;
    const dayEnd = dayStart + 1440;
    const eventStart = calendarDateTimeToAbsoluteMinutes(event.start);
    const eventEnd = Math.max(eventStart + CALENDAR_SNAP_MINUTES, calendarDateTimeToAbsoluteMinutes(event.end));
    const displayStart = Math.max(eventStart, dayStart);
    const displayEnd = Math.min(eventEnd, dayEnd);
    return {
      ...event,
      occurrenceDate: date,
      sourceStart: event.start,
      sourceEnd: event.end,
      start: absoluteMinutesToCalendarDateTime(displayStart),
      end: absoluteMinutesToCalendarDateTime(displayEnd),
      displayStartMinutes: displayStart - dayStart,
      displayEndMinutes: displayEnd - dayStart
    };
  }
  const startTime = event.start.slice(11, 16);
  const endTime = event.end.slice(11, 16);
  // An overnight event recurs with its clocks, so the end lands on the next
  // day; the visible block is clipped to this day's column like above.
  const endDate = endTime < startTime ? shiftISODate(date, 1) : date;
  const dayStart = calendarDateToDayIndex(date) * 1440;
  const eventStart = dayStart + calendarDateTimeToMinutes(`${date}T${startTime}`);
  const eventEnd = Math.max(eventStart + CALENDAR_SNAP_MINUTES, calendarDateTimeToAbsoluteMinutes(`${endDate}T${endTime}`));
  const displayEnd = Math.min(eventEnd, dayStart + 1440);
  return {
    ...event,
    occurrenceDate: date,
    start: `${date}T${startTime}`,
    end: `${endDate}T${endTime}`,
    displayStartMinutes: eventStart - dayStart,
    displayEndMinutes: displayEnd - dayStart
  };
}

/* Monday-based, the same week as startOfWorkWeek(): Sunday closes the week it
   followed. The grid used to be Sunday-based while the hours totals ran Monday
   to Sunday, and the two never agreeing was a standing confusion -- a Sunday's
   hours in the grid total that the summary had already counted last week. One
   week for everything. Since `Copy work hours` pastes exactly the range on
   screen, the grid week and the hours week being the same seven days also
   means a week-view copy is one whole week, nothing more and nothing less. */
function startOfWeek(dateString) {
  const date = dateFromISO(dateString);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return isoFromDate(date);
}

function monthStart(dateString) {
  return `${dateString.slice(0, 7)}-01`;
}

function dateFromISO(dateString) {
  return new Date(`${dateString}T12:00:00`);
}

function isoFromDate(date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function calendarRangeTitle() {
  if (calendarMode === "month") {
    return dateFromISO(calendarCursorDate).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }
  if (calendarMode === "day") {
    return dateFromISO(calendarCursorDate).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  }
  const start = startOfWeek(calendarCursorDate);
  const end = shiftISODate(start, 6);
  return `${formatShortDate(start)} - ${formatShortDate(end)}`;
}

function formatCalendarDayHeader(date) {
  return dateFromISO(date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function calendarEventTimeLabel(event) {
  if (event.allDay) return "All day";
  const sourceStart = calendarEventSourceStart(event);
  const sourceEnd = calendarEventSourceEnd(event);
  // A block that carries a move labels its end with the destination's clock,
  // the way its ticket reads and the way it was typed.
  if (event.zoneShift?.to && isValidTimeZone(event.zoneShift.to)) {
    const zone = event.zone || zoneForDate(sourceStart.slice(0, 10));
    const arrival = convertZoneWallClock(sourceEnd, zone, event.zoneShift.to);
    return `${formatClockFromTime(sourceStart.slice(11, 16))}-${formatClockFromTime(arrival.slice(11, 16))}`;
  }
  // A block clipped at midnight still labels its true span, so an overnight
  // 11:50 PM - 1:10 AM event does not read as ending at 12:00 AM.
  if (sourceEnd.slice(0, 10) !== sourceStart.slice(0, 10)) {
    return `${formatClockFromTime(sourceStart.slice(11, 16))}-${formatClockFromTime(sourceEnd.slice(11, 16))}`;
  }
  const start = minutesToClock(calendarEventStartMinutes(event));
  const end = minutesToClock(calendarEventEndMinutes(event));
  return `${formatClockFromTime(start)}-${formatClockFromTime(end)}`;
}

function formatClockFromTime(time) {
  const [hourText, minute = "00"] = String(time || "00:00").split(":");
  const hour = Number(hourText);
  if (Number.isNaN(hour)) return "";
  const date = new Date();
  date.setHours(hour, Number(minute) || 0, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function startCalendarReminders() {
  armDesktopCalendarNotificationPermission();
  listenForNotificationClicks();
  scheduleNextCalendarReminder();
  // A toggle made on another device (or in another tab) reaches this one when
  // it is next looked at, and before each hourly alert decides whether to fire.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") adoptDesktopAlertsSettingFromDisk();
  });
}

/* The alerts setting is one intent, shared by every device that opens the app
   through app-settings.json; notification *permission* is per browser. The two
   used to be conflated: any device without permission -- a phone on the local
   network, a fresh browser profile, the preview pane -- wrote `false` back
   into the shared setting the first time it was clicked or the first time a
   notification failed to construct, and the desktop's hourly alerts stopped
   without anyone having turned them off. That is how they "just went away".

   Nothing below writes the setting from a permission result any more. Only
   the toolbar toggle changes it, and it records what was asked for, not what
   this particular browser happened to allow; a browser that cannot show the
   alert says so in the status line and leaves the setting alone. */
function armDesktopCalendarNotificationPermission() {
  if (!desktopCalendarNotifications || notificationPermission() !== "default") return;
  const requestPermission = async () => {
    document.removeEventListener("pointerdown", requestPermission, true);
    document.removeEventListener("keydown", requestPermission, true);
    const permission = await window.Notification.requestPermission();
    render();
    els.saveStatus.textContent = permission === "granted"
      ? "Hourly desktop alerts on"
      : "Hourly alerts are on, but this browser blocks notifications";
  };
  document.addEventListener("pointerdown", requestPermission, { capture: true, once: true });
  document.addEventListener("keydown", requestPermission, { capture: true, once: true });
}

function notificationPermission() {
  return window.Notification ? window.Notification.permission : "unsupported";
}

function desktopNotificationButtonClass() {
  const permission = notificationPermission();
  if (desktopCalendarNotifications && permission === "granted") return "";
  return "quiet";
}

function desktopNotificationButtonTitle() {
  const permission = notificationPermission();
  if (permission === "unsupported") return "Desktop notifications are not supported in this browser";
  if (desktopCalendarNotifications && permission === "granted") return "Hourly desktop calendar notifications are on · Shift+click sends one now as a test";
  if (desktopCalendarNotifications) return "Hourly alerts are on, but this browser blocks notifications — allow them in the browser's site settings";
  if (permission === "denied") return "Turn on hourly alerts (this browser blocks notifications; allow them in its site settings)";
  return "Turn on hourly desktop calendar notifications";
}

async function toggleDesktopCalendarNotifications(clickEvent = null) {
  const permission = notificationPermission();
  if (permission === "unsupported") {
    els.saveStatus.textContent = "Desktop notifications are not supported";
    return;
  }
  // Shift-click on a lit button sends the hourly alert now, so "is this
  // working" has an answer that does not wait for the top of the hour.
  if (desktopCalendarNotifications && clickEvent?.shiftKey) {
    sendTestCalendarNotification();
    return;
  }
  if (desktopCalendarNotifications) {
    desktopCalendarNotifications = false;
    desktopCalendarNotificationsOwned = true;
    scheduleSettingsSave();
    renderCalendarView();
    els.saveStatus.textContent = "Hourly desktop alerts off";
    return;
  }
  // The intent is recorded first and unconditionally: switching alerts on
  // from a browser that then refuses permission must still switch them on for
  // the desktop that has it.
  desktopCalendarNotifications = true;
  desktopCalendarNotificationsOwned = true;
  scheduleSettingsSave();
  const nextPermission = permission === "granted" ? "granted" : await window.Notification.requestPermission();
  renderCalendarView();
  els.saveStatus.textContent = nextPermission === "granted"
    ? "Hourly desktop alerts on"
    : "Hourly alerts are on, but this browser blocks notifications";
}

function scheduleNextCalendarReminder() {
  if (calendarReminderTimer) clearTimeout(calendarReminderTimer);
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setMinutes(0, 0, 0);
  nextHour.setHours(nextHour.getHours() + 1);
  calendarReminderTimer = setTimeout(async () => {
    await adoptDesktopAlertsSettingFromDisk();
    showHourlyCalendarNotification(new Date());
    scheduleNextCalendarReminder();
  }, Math.max(1000, nextHour.getTime() - now.getTime()));
}

function sendTestCalendarNotification() {
  const now = new Date();
  const end = new Date(now);
  end.setMinutes(0, 0, 0);
  const start = new Date(end.getTime() - 60 * 60000);
  const planLine = planNowLine(now);
  showAppNotification(
    "Test: fill in your last hour",
    {
      body: `Add what you did from ${hourRangeLabel(start, end)} to the calendar.${planLine ? `\n${planLine}` : ""}`,
      tag: "calendar-actuals-test",
      renotify: true,
      silent: false
    },
    { action: "hourly-actual", start: start.toISOString(), end: end.toISOString() }
  );
  els.saveStatus.textContent = notificationPermission() === "granted" ? "Test alert sent" : "This browser blocks notifications";
}

/* One notification an hour, on the hour, that says two things: what the last
   hour still needs logging as, and what the plan says to do now. The second
   line is the "what to do" half -- it rides in the same alert rather than
   firing at the start of every plan block, because three alerts inside an
   hour is how notification blindness starts. */
function showHourlyCalendarNotification(referenceTime = new Date()) {
  const end = new Date(referenceTime);
  end.setMinutes(0, 0, 0);
  const start = new Date(end.getTime() - 60 * 60000);
  const key = isoDateTimeFromDate(end);
  if (shownCalendarReminderKeys.has(key)) return;
  shownCalendarReminderKeys.add(key);
  const planLine = planNowLine(referenceTime);
  showAppNotification(
    "Fill in your last hour",
    {
      body: `Add what you did from ${hourRangeLabel(start, end)} to the calendar.${planLine ? `\n${planLine}` : ""}`,
      tag: `calendar-actuals-hour-${key}`,
      renotify: false,
      silent: false
    },
    { action: "hourly-actual", start: start.toISOString(), end: end.toISOString() }
  );
}

// "Now: Draft brief (until 3:30 PM)" for the plan block(s) under way at this
// moment, else "Next: Call the bank at 2:30 PM" for the first one still to
// come today. Current, committed plan blocks only -- an archived or FYI block
// is not an instruction.
function planNowLine(now = new Date()) {
  const today = isoDateFromDate(now);
  const minute = now.getHours() * 60 + now.getMinutes();
  const plans = eventsForDay(today)
    .filter((event) => event.kind === "plan" && !event.supersededAt && !event.tentative && !event.allDay)
    .filter((event) => calendarEventEndMinutes(event) > minute)
    .sort((a, b) => calendarEventStartMinutes(a) - calendarEventStartMinutes(b));
  if (!plans.length) return "";
  const clock = (minutes) => formatClockFromTime(minutesToClock(minutes));
  const running = plans.filter((event) => calendarEventStartMinutes(event) <= minute);
  if (running.length) {
    return `Now: ${running.slice(0, 2).map((event) => `${event.title || "Untitled"} (until ${clock(calendarEventEndMinutes(event))})`).join(", ")}`;
  }
  const next = plans[0];
  return `Next: ${next.title || "Untitled"} at ${clock(calendarEventStartMinutes(next))}`;
}

// One ping a night, at 21:00. "Bed by 10" and the day's unticked goals ride along
// in the same notification rather than firing separately — three alerts inside an
// hour is how notification blindness starts, and the whole point of this system
// is to stay visible past week three.
const NIGHT_SURVEY_REMINDER_HOUR = 21;

function startNightSurveyReminders() {
  scheduleNextNightSurveyReminder();
}

function scheduleNextNightSurveyReminder() {
  if (nightSurveyReminderTimer) clearTimeout(nightSurveyReminderTimer);
  const now = new Date();
  const next = new Date(now);
  next.setHours(NIGHT_SURVEY_REMINDER_HOUR, 0, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  nightSurveyReminderTimer = setTimeout(() => {
    showNightSurveyNotification(new Date());
    scheduleNextNightSurveyReminder();
  }, Math.max(1000, next.getTime() - now.getTime()));
}

function showNightSurveyNotification(referenceTime = new Date()) {
  const key = isoDateFromDate(referenceTime);
  if (shownNightSurveyReminderKeys.has(key)) return;
  shownNightSurveyReminderKeys.add(key);
  const rule = ruleForDate(key);
  const body = rule
    ? `Rule today: ${rule.title}. Bed by 10 — do the survey now.`
    : "Bed by 10 — do the survey now.";
  showAppNotification(
    "Night survey",
    { body, tag: `night-survey-${key}`, renotify: false, silent: false },
    { action: "night-survey" }
  );
}

/* Posting the alert. The page constructor is the normal path and the one the
   desktop uses. Android Chrome refuses it ("Illegal constructor") and wants
   the service worker to post instead, so that is the fallback; its clicks come
   back through the worker as a message (see sw.js) and land in the same
   handleNotificationAction(). A failure here is a fact about this browser, not
   about the setting, and never touches it. */
const NOTIFICATION_AUTO_CLOSE_MS = 180000;

async function showAppNotification(title, options, data) {
  if (!desktopCalendarNotifications || notificationPermission() !== "granted") return;
  try {
    const notification = new window.Notification(title, options);
    notification.onclick = () => {
      notification.close();
      handleNotificationAction(data);
    };
    setTimeout(() => notification.close(), NOTIFICATION_AUTO_CLOSE_MS);
  } catch {
    // Best effort: a device that cannot show the alert is still a working app.
    // (The service-worker fallback is gone with the service worker itself --
    // see index.html.)
  }
}

function handleNotificationAction(data = {}) {
  window.focus();
  if (data.action === "hourly-actual" && data.start && data.end) {
    openHourlyActualDraft(new Date(data.start), new Date(data.end));
  } else if (data.action === "night-survey") {
    setSession("night", { keepView: true });
    setView("survey");
  }
}

function listenForNotificationClicks() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.addEventListener("message", (event) => {
    const message = event.data;
    if (!message || message.type !== "notification-click") return;
    handleNotificationAction(message.data || {});
  });
}

function isoDateFromDate(date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function hourRangeLabel(start, end) {
  const format = { hour: "numeric", minute: "2-digit" };
  return `${start.toLocaleTimeString(undefined, format)}–${end.toLocaleTimeString(undefined, format)}`;
}

function openHourlyActualDraft(startDate, endDate) {
  const start = isoDateTimeFromDate(startDate);
  const rawEnd = isoDateTimeFromDate(endDate);
  const end = rawEnd.slice(0, 10) === start.slice(0, 10) ? rawEnd : `${start.slice(0, 10)}T23:59`;
  calendarCursorDate = start.slice(0, 10);
  state.currentDate = calendarCursorDate;
  activeView = "calendar";
  calendarKindFilter = "actual";
  openCalendarEditor(calendarCursorDate, {
    title: "",
    start,
    end,
    kind: "actual",
    category: "",
    color: CALENDAR_COLORS[0]
  });
}

function isoDateTimeFromDate(date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

function taskRow(sectionKey, task, sourceDate = state.currentDate, options = {}) {
  const row = document.createElement("div");
  row.className = "task-row";
  row.dataset.taskId = task.id;
  row.dataset.sourceDate = sourceDate || state.currentDate;
  if (sourceDate && sourceDate !== state.currentDate) row.classList.add("is-carried-forward");
  if (options.overdueDate) row.classList.add("is-overdue");
  row.dataset.priority = task.priority || "p4";
  row.draggable = true;
  row.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("section", sectionKey);
    event.dataTransfer.setData("sourceDate", sourceDate || state.currentDate);
    event.dataTransfer.setData("taskId", task.id);
    event.dataTransfer.effectAllowed = "move";
    taskDragState = {
      row,
      sectionKey,
      sourceDate: sourceDate || state.currentDate,
      priority: row.dataset.priority,
      liveReorder: Boolean(options.canReorder),
      tierLocked: Boolean(options.tierLocked)
    };
    row.classList.add("is-dragging");
  });
  row.addEventListener("dragend", () => {
    row.classList.remove("is-dragging");
    if (!taskDragState) return;
    // Cancelled drag: the preview moved rows around, so redraw the stored order.
    taskDragState = null;
    renderTasksView();
  });

  const done = document.createElement("button");
  done.type = "button";
  done.className = "complete-task-button";
  done.setAttribute("aria-label", "Complete task");
  done.title = "Complete task";
  done.addEventListener("click", () => completeTask(sectionKey, task.id, sourceDate, options.overdueDate ? todayISO() : state.currentDate));

  const input = document.createElement("input");
  input.type = "text";
  input.dataset.taskEditor = "text";
  input.value = task.text || "";
  input.addEventListener("focus", deferTaskSync);
  input.addEventListener("input", () => updateTask(sectionKey, task.id, input.value, sourceDate));
  input.addEventListener("blur", () => {
    deferTaskSync();
    saveEverywhere({ extraDates: [sourceDate] });
  });

  const meta = document.createElement("div");
  meta.className = "task-meta";
  const priority = document.createElement("select");
  priority.title = "Priority";
  for (const option of PRIORITY_OPTIONS) {
    const item = document.createElement("option");
    item.value = option.value;
    item.textContent = option.label;
    priority.append(item);
  }
  priority.value = task.priority || "p4";
  priority.addEventListener("change", () => updateTaskMeta(sectionKey, task.id, { priority: priority.value }, sourceDate));

  // Minutes, not a duration picker: the number is a guess, and typing "30" is
  // the whole interaction. It sizes the block this task drops as.
  const estimate = document.createElement("input");
  estimate.type = "number";
  estimate.min = "0";
  estimate.step = "5";
  estimate.className = "task-estimate-input";
  estimate.title = "Estimated minutes";
  estimate.placeholder = "min";
  estimate.value = task.estimateMinutes ? String(task.estimateMinutes) : "";
  estimate.addEventListener("focus", deferTaskSync);
  estimate.addEventListener("change", () =>
    updateTaskMeta(sectionKey, task.id, { estimateMinutes: normalizeEstimateMinutes(estimate.value) }, sourceDate)
  );

  const category = taskCategorySelect(task, (value) =>
    updateTaskMeta(sectionKey, task.id, { calendarCategory: value }, sourceDate)
  );

  const due = document.createElement("input");
  due.type = "date";
  due.title = "Date";
  due.value = task.dueDate || options.overdueDate || "";
  due.addEventListener("change", () => updateTaskMeta(sectionKey, task.id, { dueDate: due.value }, sourceDate));

  const project = document.createElement("input");
  project.type = "text";
  project.title = "Project";
  project.placeholder = "Project";
  project.value = task.project || "";
  project.addEventListener("change", () => updateTaskMeta(sectionKey, task.id, { project: project.value.trim() }, sourceDate));

  const labels = document.createElement("input");
  labels.type = "text";
  labels.title = "Labels";
  labels.placeholder = "Labels";
  labels.value = (task.labels || []).join(", ");
  labels.addEventListener("change", () => updateTaskMeta(sectionKey, task.id, { labels: parseLabels(labels.value) }, sourceDate));

  const section = document.createElement("select");
  section.title = "Section";
  for (const option of TASK_SECTIONS) {
    const item = document.createElement("option");
    item.value = option.key;
    item.textContent = option.title;
    section.append(item);
  }
  section.value = sectionKey;
  section.addEventListener("change", () => moveTaskToSection(sectionKey, task.id, section.value, sourceDate));

  meta.append(priority, estimate, category, due, project, labels, section);

  const place = document.createElement("button");
  place.type = "button";
  place.className = "place-task-button";
  place.textContent = "◷";
  applyPlaceButtonState(place, task);
  place.addEventListener("click", () => startTaskPlacement(sectionKey, task, sourceDate));

  const grip = document.createElement("button");
  grip.type = "button";
  grip.className = "drag-handle";
  grip.setAttribute("aria-label", "Drag to reorder");
  grip.title = "Drag to reorder";
  grip.textContent = "::";

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "delete-task-button";
  remove.setAttribute("aria-label", "Delete task");
  remove.title = "Delete task";
  remove.textContent = "x";
  remove.addEventListener("click", () => deleteTask(sectionKey, task.id, sourceDate));

  const body = document.createElement("div");
  body.className = "task-body";
  if (options.overdueDate) {
    const overdue = document.createElement("div");
    overdue.className = "task-overdue-label";
    const label = document.createElement("span");
    label.textContent = `Overdue since ${formatShortDate(options.overdueDate)}`;
    const reschedule = document.createElement("button");
    reschedule.type = "button";
    reschedule.className = "quiet";
    reschedule.textContent = "Move to today";
    reschedule.addEventListener("click", () => rescheduleOverdueTaskForToday(sectionKey, task.id, sourceDate));
    overdue.append(label, reschedule);
    body.append(overdue);
  } else {
    const note = taskDateNote(task, sourceDate);
    if (note) {
      const dateNote = document.createElement("div");
      dateNote.className = "task-date-note";
      if (taskExpiryDate(task, sourceDate)) dateNote.classList.add("is-expiring");
      dateNote.textContent = note;
      body.append(dateNote);
    }
  }
  body.append(input, meta);

  row.append(done, body, place, grip, remove);
  return row;
}

function visibleTaskSections(entry) {
  const overdue = overdueTaskItems();
  if (taskFilter === "all") {
    return overdue.length ? [{ ...OVERDUE_SECTION, virtualTasks: overdue }, ...TASK_SECTIONS] : TASK_SECTIONS;
  }
  if (taskFilter === "overdue") return [{ ...OVERDUE_SECTION, virtualTasks: overdue }];
  if (TASK_SECTION_KEYS.includes(taskFilter)) return TASK_SECTIONS.filter((section) => section.key === taskFilter);
  const groups = groupedTaskSections(entry, taskFilter);
  return groups.map((group) => ({
    key: group.key,
    title: group.title,
    empty: "No matching tasks.",
    virtualTasks: group.tasks
  }));
}

function groupedTaskSections(entry, groupBy) {
  const tasks = activeTasks(entry);
  const groups = new Map();
  const add = (key, title, task) => {
    if (!groups.has(key)) groups.set(key, { key, title, tasks: [] });
    groups.get(key).tasks.push(task);
  };
  for (const item of tasks) {
    const task = item.task;
    if (groupBy === "projects") {
      add(`project-${task.project || "none"}`, task.project ? `#${task.project}` : "No project", item);
    } else if (groupBy === "labels") {
      const labels = task.labels?.length ? task.labels : ["none"];
      for (const label of labels) add(`label-${label}`, label === "none" ? "No label" : `@${label}`, item);
    } else if (groupBy === "priority") {
      add(task.priority || "p4", (task.priority || "p4").toUpperCase(), item);
    }
  }
  return [...groups.values()].sort((a, b) => a.title.localeCompare(b.title));
}

function activeTasks(entry) {
  const items = [...overdueTaskItems(), ...TASK_SECTION_KEYS.flatMap((sectionKey) => taskItemsForKey(entry, sectionKey))];
  const seen = new Set();
  return items.filter((item) => {
    if (!item.task?.id || seen.has(item.task.id)) return false;
    seen.add(item.task.id);
    return true;
  });
}

function taskFilterCount(filterKey, entry) {
  if (filterKey === "all") return activeTasks(entry).length;
  if (filterKey === "overdue") return overdueTaskItems().length;
  if (TASK_SECTION_KEYS.includes(filterKey)) return taskItemsForKey(entry, filterKey).length;
  if (filterKey === "projects") return new Set(activeTasks(entry).map(({ task }) => task.project).filter(Boolean)).size;
  if (filterKey === "labels") return new Set(activeTasks(entry).flatMap(({ task }) => task.labels || [])).size;
  if (filterKey === "priority") return activeTasks(entry).filter(({ task }) => task.priority && task.priority !== "p4").length;
  return 0;
}

function taskItemsForKey(entry, sectionKey) {
  if (sectionKey === "inbox") return carriedInboxTaskItems(entry);
  const sourceDate = taskStorageDate(entry.date, sectionKey);
  return tasksForDate(sourceDate, sectionKey).map((task) => ({ sectionKey, sourceDate, task }));
}

function carriedInboxTaskItems(entry) {
  const currentDate = entry.date || state.currentDate;
  const items = [];
  const seen = new Set();
  const addTasks = (sourceEntry) => {
    ensureTaskState(sourceEntry);
    for (const task of sourceEntry.tasks.inbox || []) {
      if (!task?.id || seen.has(task.id)) continue;
      seen.add(task.id);
      items.push({ sectionKey: "inbox", sourceDate: sourceEntry.date, task });
    }
  };
  addTasks(entry);
  for (const date of Object.keys(state.entries || {}).sort().reverse()) {
    if (date >= currentDate || date === entry.date) continue;
    const sourceEntry = state.entries[date];
    if (!sourceEntry?.tasks) continue;
    addTasks(sourceEntry);
  }
  return items;
}

function shouldSurfaceOverdueTasks(viewDate = state.currentDate, actualDate = todayISO()) {
  return String(viewDate || "") >= actualDate;
}

function taskEffectiveDueDate(task, sectionKey, sourceDate) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(task?.dueDate || ""))) return task.dueDate;
  return sectionKey === "today" && /^\d{4}-\d{2}-\d{2}$/.test(String(sourceDate || "")) ? sourceDate : "";
}

function isTaskOverdueForActualDate(task, sectionKey, sourceDate, actualDate = todayISO()) {
  const dueDate = taskEffectiveDueDate(task, sectionKey, sourceDate);
  return Boolean(dueDate && dueDate < actualDate);
}

function overdueTaskItems() {
  if (!shouldSurfaceOverdueTasks()) return [];
  const actualDate = todayISO();
  const items = [];
  const seen = new Set();
  for (const sourceDate of Object.keys(state.entries || {}).sort()) {
    const sourceEntry = state.entries[sourceDate];
    if (!sourceEntry?.tasks) continue;
    ensureTaskState(sourceEntry);
    for (const sectionKey of TASK_SECTION_KEYS) {
      for (const task of sourceEntry.tasks[sectionKey] || []) {
        if (!task?.id || seen.has(task.id) || !isTaskOverdueForActualDate(task, sectionKey, sourceDate, actualDate)) continue;
        seen.add(task.id);
        items.push({
          sectionKey,
          displaySectionKey: "overdue",
          sourceDate,
          overdueDate: taskEffectiveDueDate(task, sectionKey, sourceDate),
          task
        });
      }
    }
  }
  return items.sort((a, b) => {
    if (a.overdueDate !== b.overdueDate) return a.overdueDate.localeCompare(b.overdueDate);
    return compareTaskItems(a, b);
  });
}

function taskItemsForSection(entry, section, virtualItems) {
  const taskItems = (virtualItems || taskItemsForKey(entry, section.key)).slice();
  if (!virtualItems && (section.key === "rightNow" || section.key === "today")) return sortTieredTaskItems(taskItems);
  return taskItems.sort(compareTaskItems);
}

// Do right now and Today are manual queues inside automatic priority tiers: P1
// on top through P4 on the bottom, and stored list order decides everything
// inside one tier.
function sortTieredTaskItems(taskItems) {
  return taskItems
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const byPriority = taskPriorityRank(a.item.task) - taskPriorityRank(b.item.task);
      return byPriority !== 0 ? byPriority : a.index - b.index;
    })
    .map(({ item }) => item);
}

function taskPriorityRank(task) {
  const rank = Number(String(task?.priority || "p4").slice(1));
  return Number.isFinite(rank) && rank >= 1 && rank <= 4 ? rank : 4;
}

function parseLabels(value) {
  return String(value || "")
    .split(/[, ]+/)
    .map((label) => label.replace(/^@/, "").trim())
    .filter(Boolean);
}

function formatEstimate(minutes) {
  const total = normalizeEstimateMinutes(minutes);
  if (!total) return "";
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (!hours) return `${rest}m`;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

// Which day a row belongs to, said out loud. An inbox full of identical habit
// rows is unreadable without it: "15 LinkedIn points" three times over tells you
// nothing, "15 LinkedIn points · today only" against "· for Jul 30" does.
function taskDateNote(task, sourceDate) {
  const date = sourceDate || state.currentDate;
  const expiresOn = taskExpiryDate(task, date);
  if (expiresOn) return expiresOn === todayISO() ? "Today only" : `For ${formatShortDate(expiresOn)}`;
  if (date === state.currentDate) return "";
  return task.goalId ? `For ${formatShortDate(date)}` : `Added ${formatShortDate(date)}`;
}

function taskDisplayLine(task, fallbackDate = "", sourceDate = "") {
  const bits = [task.text];
  if (task.estimateMinutes) bits.push(formatEstimate(task.estimateMinutes));
  if (task.dueTime) bits.push(formatClockFromTime(task.dueTime));
  if (task.priority && task.priority !== "p4") bits.push(task.priority.toUpperCase());
  if (task.project) bits.push(`#${task.project}`);
  if (task.dueDate || fallbackDate) bits.push(formatShortDate(task.dueDate || fallbackDate));
  // An undated inbox row still belongs to a day, and the sidebar is the surface
  // the queue is read from most, so it says which.
  else bits.push(taskDateNote(task, sourceDate));
  return bits.filter(Boolean).join(" \u00b7 ");
}

function compareTaskItems(a, b) {
  const aDate = a.task.dueDate || "9999-12-31";
  const bDate = b.task.dueDate || "9999-12-31";
  if (aDate !== bDate) return aDate.localeCompare(bDate);
  const aPriority = Number((a.task.priority || "p4").slice(1));
  const bPriority = Number((b.task.priority || "p4").slice(1));
  if (aPriority !== bPriority) return aPriority - bPriority;
  return String(a.task.createdAt || "").localeCompare(String(b.task.createdAt || ""));
}

// --- Learn about -------------------------------------------------------------
// A standing backlog of things to read up on, captured by Ctrl+Alt+L
// (learn-capture.ps1) or typed straight into the view. Server-owned and
// cross-day like goals, so it lives outside `state` and outside entries/*.json:
// nothing here touches the entry revision model. Every write is item-scoped
// (/api/learn-list, /update, /delete) rather than a full-array POST, so the
// hotkey window and this view can both be open without clobbering each other.

let learnItems = [];
let learnShowLearned = false;

async function loadLearnListFromDisk() {
  try {
    const response = await fetch("/api/learn-list");
    if (!response.ok) return;
    const data = await response.json();
    if (Array.isArray(data.items)) learnItems = data.items;
  } catch {
    // Offline is a degraded read: the view renders empty rather than breaking.
  }
}

async function learnWrite(path, payload) {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) return false;
    const data = await response.json();
    // The server always answers with the whole list, so a write and a
    // concurrent hotkey capture converge without a second fetch.
    if (Array.isArray(data.items)) learnItems = data.items;
    return true;
  } catch {
    return false;
  }
}

async function addLearnItem(text, link) {
  const trimmedText = String(text || "").trim();
  const trimmedLink = String(link || "").trim();
  if (!trimmedText && !trimmedLink) return;
  await learnWrite("/api/learn-list", { text: trimmedText, link: trimmedLink, source: "app" });
  renderLearnView(true);
}

async function patchLearnItem(id, patch) {
  await learnWrite("/api/learn-list/update", { id, ...patch });
  renderLearnView(true);
}

async function removeLearnItem(id) {
  await learnWrite("/api/learn-list/delete", { id });
  renderLearnView(true);
}

// Open items newest first - a curiosity written down today is the one most
// likely to still be live. Learned items sink below and are hidden by default.
function sortedLearnItems() {
  const open = learnItems.filter((item) => !item.learned);
  const done = learnItems.filter((item) => item.learned);
  open.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  done.sort((a, b) => String(b.learnedAt || b.createdAt || "").localeCompare(String(a.learnedAt || a.createdAt || "")));
  return { open, done };
}

function learnLinkHref(link) {
  return /^https?:\/\//i.test(String(link || "")) ? link : "";
}

function learnLinkLabel(link) {
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return link;
  }
}

function formatLearnDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// `force` is what our own handlers pass after a write. Without it a rebuild
// triggered by an unrelated render (the task sync poll, a date change) while a
// field has focus would throw away whatever is half-typed in it.
function renderLearnView(force = false) {
  if (!force && els.learnView.contains(document.activeElement) && document.activeElement?.matches?.("input, textarea")) {
    return;
  }
  els.learnView.innerHTML = "";
  const { open, done } = sortedLearnItems();

  const toolbar = document.createElement("div");
  toolbar.className = "learn-toolbar";
  const summary = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = "Things to learn about";
  const status = document.createElement("p");
  status.textContent = open.length
    ? `${open.length} open${done.length ? ` · ${done.length} learned` : ""} · Ctrl+Alt+L adds one from anywhere`
    : "Nothing waiting. Ctrl+Alt+L adds one from anywhere.";
  summary.append(title, status);
  const actions = document.createElement("div");
  actions.className = "learn-toolbar-actions";
  if (done.length) {
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = learnShowLearned ? "quiet active" : "quiet";
    toggle.textContent = learnShowLearned ? "Hide learned" : `Learned (${done.length})`;
    toggle.addEventListener("click", () => {
      learnShowLearned = !learnShowLearned;
      renderLearnView(true);
    });
    actions.append(toggle);
  }
  toolbar.append(summary, actions);
  els.learnView.append(toolbar);

  const quickAdd = document.createElement("form");
  quickAdd.className = "learn-quick-add";
  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.placeholder = "What to learn about";
  const linkInput = document.createElement("input");
  linkInput.type = "text";
  linkInput.placeholder = "Link (optional)";
  const addButton = document.createElement("button");
  addButton.type = "submit";
  addButton.textContent = "Add";
  quickAdd.append(textInput, linkInput, addButton);
  quickAdd.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = textInput.value;
    const link = linkInput.value;
    textInput.value = "";
    linkInput.value = "";
    addLearnItem(text, link);
  });
  els.learnView.append(quickAdd);

  if (!open.length && !(learnShowLearned && done.length)) {
    const empty = document.createElement("p");
    empty.className = "learn-empty";
    empty.textContent = done.length
      ? "Nothing open. Everything on the list has been learned."
      : "Nothing on the list yet.";
    els.learnView.append(empty);
    return;
  }

  const list = document.createElement("div");
  list.className = "learn-list";
  for (const item of open) list.append(renderLearnCard(item));
  if (learnShowLearned) {
    for (const item of done) list.append(renderLearnCard(item));
  }
  els.learnView.append(list);
}

function renderLearnCard(item) {
  const card = document.createElement("article");
  card.className = item.learned ? "learn-card is-learned" : "learn-card";

  const head = document.createElement("div");
  head.className = "learn-card-head";

  const check = document.createElement("input");
  check.type = "checkbox";
  check.checked = Boolean(item.learned);
  check.title = item.learned ? "Put it back on the list" : "Mark as learned";
  check.addEventListener("change", () => patchLearnItem(item.id, { learned: check.checked }));

  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.className = "learn-card-text";
  textInput.value = item.text || "";
  textInput.placeholder = "What to learn about";
  textInput.addEventListener("change", () => patchLearnItem(item.id, { text: textInput.value }));

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "icon-button quiet";
  remove.textContent = "×";
  remove.title = "Remove";
  remove.addEventListener("click", () => removeLearnItem(item.id));

  head.append(check, textInput, remove);
  card.append(head);

  const foot = document.createElement("div");
  foot.className = "learn-card-foot";

  const linkInput = document.createElement("input");
  linkInput.type = "text";
  linkInput.className = "learn-card-link";
  linkInput.value = item.link || "";
  linkInput.placeholder = "Link (optional)";
  linkInput.addEventListener("change", () => patchLearnItem(item.id, { link: linkInput.value }));
  foot.append(linkInput);

  // Only http/https ever becomes a real anchor; anything else stays as the
  // plain note it is.
  const href = learnLinkHref(item.link);
  if (href) {
    const open = document.createElement("a");
    open.href = href;
    open.target = "_blank";
    open.rel = "noreferrer noopener";
    open.className = "learn-card-open";
    open.textContent = learnLinkLabel(href);
    open.title = href;
    foot.append(open);
  }

  const stamp = document.createElement("span");
  stamp.className = "learn-card-stamp";
  stamp.textContent = item.learned
    ? `learned ${formatLearnDate(item.learnedAt || item.createdAt)}`
    : formatLearnDate(item.createdAt);
  foot.append(stamp);

  card.append(foot);
  return card;
}

// --- Shopping list -----------------------------------------------------------
// A standing cross-day list, same shape as the learn backlog above: server-owned
// in shopping-list.json, outside `state` and outside the entry revision model.
// Every write is item-scoped (/api/shopping-list, /update, /delete) so the
// desktop and the phone PWA can both be open without clobbering each other.
// The cards reuse the learn-* styles on purpose - same kind of surface, one
// look - so restyling the learn view restyles this one too.

let shoppingItems = [];
let shoppingShowBought = false;
// "added" keeps the written-down order; "category" groups open items by tag.
let shoppingSortMode = "added";

// The starter categories. The picker also offers every tag already in use plus
// a "New tag…" choice, so growing the set is just typing a new name once.
const DEFAULT_SHOPPING_TAGS = ["groceries", "appliances", "misc"];

function shoppingTagOptions() {
  const tags = [...DEFAULT_SHOPPING_TAGS];
  const extras = new Set();
  for (const item of shoppingItems) {
    const tag = String(item.tag || "").trim().toLowerCase();
    if (tag && !tags.includes(tag)) extras.add(tag);
  }
  return tags.concat([...extras].sort());
}

async function loadShoppingListFromDisk() {
  try {
    const response = await fetch("/api/shopping-list");
    if (!response.ok) return;
    const data = await response.json();
    if (Array.isArray(data.items)) shoppingItems = data.items;
  } catch {
    // Offline is a degraded read: the view renders empty rather than breaking.
  }
}

async function shoppingWrite(path, payload) {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) return false;
    const data = await response.json();
    // The server always answers with the whole list, so two open windows
    // converge without a second fetch.
    if (Array.isArray(data.items)) shoppingItems = data.items;
    return true;
  } catch {
    return false;
  }
}

async function addShoppingItem(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return;
  await shoppingWrite("/api/shopping-list", { text: trimmed, source: "app" });
  renderShoppingView(true);
  // Groceries come to mind in batches, so the quick-add keeps focus for the
  // next one instead of making every item cost a click.
  els.shoppingView.querySelector(".shopping-quick-add input")?.focus();
}

async function patchShoppingItem(id, patch) {
  await shoppingWrite("/api/shopping-list/update", { id, ...patch });
  renderShoppingView(true);
}

async function removeShoppingItem(id) {
  await shoppingWrite("/api/shopping-list/delete", { id });
  renderShoppingView(true);
}

// One store trip ends with a pile of ticked rows; this clears them in one go.
// Deletes stay item-scoped (the server serialises them) rather than becoming a
// full-array POST.
async function clearBoughtShoppingItems() {
  for (const item of shoppingItems.filter((entry) => entry.bought)) {
    await shoppingWrite("/api/shopping-list/delete", { id: item.id });
  }
  renderShoppingView(true);
}

// Open items oldest first - unlike the learn backlog, the list should read in
// the order it was written down. Bought items sink below, newest first.
function sortedShoppingItems() {
  const open = shoppingItems.filter((item) => !item.bought);
  const done = shoppingItems.filter((item) => item.bought);
  open.sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")));
  done.sort((a, b) => String(b.boughtAt || b.createdAt || "").localeCompare(String(a.boughtAt || a.createdAt || "")));
  return { open, done };
}

// `force` is what our own handlers pass after a write, same contract as
// renderLearnView: an unrelated render must not rebuild while a field here has
// focus, or half-typed text is thrown away.
function renderShoppingView(force = false) {
  if (!force && els.shoppingView.contains(document.activeElement) && document.activeElement?.matches?.("input, textarea")) {
    return;
  }
  els.shoppingView.innerHTML = "";
  const { open, done } = sortedShoppingItems();

  const toolbar = document.createElement("div");
  toolbar.className = "learn-toolbar";
  const summary = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = "Shopping list";
  const status = document.createElement("p");
  status.textContent = open.length
    ? `${open.length} to buy${done.length ? ` · ${done.length} bought` : ""}`
    : "Nothing to buy.";
  summary.append(title, status);
  const actions = document.createElement("div");
  actions.className = "learn-toolbar-actions";
  if (open.length) {
    const sortToggle = document.createElement("button");
    sortToggle.type = "button";
    sortToggle.className = shoppingSortMode === "category" ? "quiet active" : "quiet";
    sortToggle.textContent = "By category";
    sortToggle.title = shoppingSortMode === "category" ? "Back to the order items were added" : "Group items by category";
    sortToggle.addEventListener("click", () => {
      shoppingSortMode = shoppingSortMode === "category" ? "added" : "category";
      renderShoppingView(true);
    });
    actions.append(sortToggle);
  }
  if (done.length) {
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = shoppingShowBought ? "quiet active" : "quiet";
    toggle.textContent = shoppingShowBought ? "Hide bought" : `Bought (${done.length})`;
    toggle.addEventListener("click", () => {
      shoppingShowBought = !shoppingShowBought;
      renderShoppingView(true);
    });
    actions.append(toggle);
    if (shoppingShowBought) {
      const clear = document.createElement("button");
      clear.type = "button";
      clear.className = "quiet";
      clear.textContent = "Clear bought";
      clear.title = "Remove every bought item";
      clear.addEventListener("click", () => clearBoughtShoppingItems());
      actions.append(clear);
    }
  }
  toolbar.append(summary, actions);
  els.shoppingView.append(toolbar);

  const quickAdd = document.createElement("form");
  quickAdd.className = "shopping-quick-add";
  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.placeholder = "Add an item";
  const addButton = document.createElement("button");
  addButton.type = "submit";
  addButton.textContent = "Add";
  quickAdd.append(textInput, addButton);
  quickAdd.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = textInput.value;
    textInput.value = "";
    addShoppingItem(text);
  });
  els.shoppingView.append(quickAdd);

  if (!open.length && !(shoppingShowBought && done.length)) {
    const empty = document.createElement("p");
    empty.className = "learn-empty";
    empty.textContent = done.length
      ? "Nothing to buy. Everything on the list has been bought."
      : "Nothing on the list yet.";
    els.shoppingView.append(empty);
    return;
  }

  const list = document.createElement("div");
  list.className = "learn-list";
  if (shoppingSortMode === "category") {
    // Known tags first in their picker order, then any extra tags, untagged
    // items last - within a group the written-down order still holds.
    const groups = new Map();
    for (const item of open) {
      const tag = String(item.tag || "").trim().toLowerCase();
      if (!groups.has(tag)) groups.set(tag, []);
      groups.get(tag).push(item);
    }
    const order = shoppingTagOptions().filter((tag) => groups.has(tag));
    if (groups.has("")) order.push("");
    for (const tag of order) {
      const head = document.createElement("h4");
      head.className = "shopping-group-head";
      head.textContent = tag || "no category";
      list.append(head);
      for (const item of groups.get(tag)) list.append(renderShoppingCard(item));
    }
  } else {
    for (const item of open) list.append(renderShoppingCard(item));
  }
  if (shoppingShowBought) {
    for (const item of done) list.append(renderShoppingCard(item));
  }
  els.shoppingView.append(list);
}

function renderShoppingCard(item) {
  const card = document.createElement("article");
  card.className = item.bought ? "learn-card is-learned" : "learn-card";

  const head = document.createElement("div");
  head.className = "learn-card-head";

  const check = document.createElement("input");
  check.type = "checkbox";
  check.checked = Boolean(item.bought);
  check.title = item.bought ? "Put it back on the list" : "Mark as bought";
  check.addEventListener("change", () => patchShoppingItem(item.id, { bought: check.checked }));

  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.className = "learn-card-text";
  textInput.value = item.text || "";
  textInput.placeholder = "What to buy";
  textInput.addEventListener("change", () => patchShoppingItem(item.id, { text: textInput.value }));

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "icon-button quiet";
  remove.textContent = "×";
  remove.title = "Remove";
  remove.addEventListener("click", () => removeShoppingItem(item.id));

  head.append(check, textInput, remove);
  card.append(head);

  // Tag, where-to-buy, and a slot for pasting candidate URLs. All borderless
  // until focused, same reading-not-form contract as the learn cards.
  const meta = document.createElement("div");
  meta.className = "shopping-card-meta";

  const tagSelect = document.createElement("select");
  tagSelect.className = "shopping-tag-select";
  tagSelect.title = "Category";
  const currentTag = String(item.tag || "").trim().toLowerCase();
  const noTag = document.createElement("option");
  noTag.value = "";
  noTag.textContent = "no category";
  tagSelect.append(noTag);
  for (const tag of shoppingTagOptions()) {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    tagSelect.append(option);
  }
  const newTag = document.createElement("option");
  newTag.value = "__new__";
  newTag.textContent = "new tag…";
  tagSelect.append(newTag);
  tagSelect.value = currentTag;
  tagSelect.addEventListener("change", () => {
    if (tagSelect.value !== "__new__") {
      patchShoppingItem(item.id, { tag: tagSelect.value });
      return;
    }
    // "New tag…" swaps the select for a one-shot text box; committing patches
    // the item, and the picker then offers the tag everywhere it is in use.
    const tagInput = document.createElement("input");
    tagInput.type = "text";
    tagInput.className = "shopping-tag-input";
    tagInput.placeholder = "New tag";
    tagInput.addEventListener("change", () => {
      const value = tagInput.value.trim().toLowerCase();
      if (value) patchShoppingItem(item.id, { tag: value });
      else renderShoppingView(true);
    });
    tagInput.addEventListener("keydown", (event) => {
      if (event.key === "Escape") renderShoppingView(true);
    });
    tagSelect.replaceWith(tagInput);
    tagInput.focus();
  });

  const whereInput = document.createElement("input");
  whereInput.type = "text";
  whereInput.className = "shopping-where";
  whereInput.value = item.where || "";
  whereInput.placeholder = "Where — store, Amazon, FB marketplace…";
  whereInput.title = "Where to buy it";
  whereInput.addEventListener("change", () => patchShoppingItem(item.id, { where: whereInput.value }));

  const linkAdd = document.createElement("input");
  linkAdd.type = "text";
  linkAdd.className = "shopping-link-add";
  linkAdd.placeholder = "+ add url";
  linkAdd.title = "Paste a candidate URL";
  linkAdd.addEventListener("change", () => {
    const value = linkAdd.value.trim();
    if (!value) return;
    linkAdd.value = "";
    patchShoppingItem(item.id, { urls: [...(item.urls || []), value] });
  });

  meta.append(tagSelect, whereInput, linkAdd);
  card.append(meta);

  const urls = Array.isArray(item.urls) ? item.urls : [];
  if (urls.length) {
    const links = document.createElement("div");
    links.className = "shopping-card-links";
    for (const url of urls) {
      const chip = document.createElement("span");
      chip.className = "shopping-link-chip";
      const anchor = document.createElement("a");
      anchor.href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.title = url;
      let label = url;
      try {
        label = new URL(anchor.href).hostname.replace(/^www\./, "");
      } catch {
        // Not parseable as a URL - show the raw text.
      }
      anchor.textContent = label;
      const drop = document.createElement("button");
      drop.type = "button";
      drop.textContent = "×";
      drop.title = "Remove this link";
      drop.addEventListener("click", () => {
        patchShoppingItem(item.id, { urls: urls.filter((entry) => entry !== url) });
      });
      chip.append(anchor, drop);
      links.append(chip);
    }
    card.append(links);
  }

  const foot = document.createElement("div");
  foot.className = "learn-card-foot";
  const stamp = document.createElement("span");
  stamp.className = "learn-card-stamp";
  stamp.textContent = item.bought
    ? `bought ${formatLearnDate(item.boughtAt || item.createdAt)}`
    : formatLearnDate(item.createdAt);
  foot.append(stamp);
  card.append(foot);

  return card;
}

// --- Goals -------------------------------------------------------------------
// Goal state is server-owned and cross-day, so it lives outside `state` and
// outside entries/*.json. Check-ins are append-only events posted to
// /api/goal-log, which keeps them clear of the entry revision/merge model
// entirely (see LLM_README "Never let the client adopt a revision without the
// data"). Readers always take the newest event for a (goal, date, kind).

let goalsDoc = {
  version: 1,
  contexts: [],
  contextSchedule: [],
  backlogGraceDays: 2,
  ruleSchedule: {},
  goals: []
};
let goalLog = [];
let goalBacklogUnlocked = false;

// Goals are read once at boot, and a single failed read used to leave the doc
// empty for the whole session -- which every rule surface then reported as "no
// rule scheduled for this date". That reads as a gap in the schedule and sends
// you off to fill one in by hand, when the truth is that the server was never
// reached. The cache keeps the rule of the day working out of the service-worker
// shell, and goalsDocLoaded records whether the doc in hand is the live one.
const GOALS_CACHE_KEY = "aa-journal-goals-v1";
let goalsDocLoaded = false;

/* ---- People registry (Rolodex) ----
   Each person is a record with a stable id, a display name, aliases (every
   former name), and free-form tags. Survey answers keep storing the display
   STRING, exactly as before -- the registry is an overlay, so the exports, the
   workbook, and choice history never see it. A rename records the old display
   as an alias, which is what keeps past days countable; the first tag is the
   group a person files under in the picker and the Rolodex. */

let peopleList = [];
let peopleLoaded = false;
let peopleSaveTimer = null;
let peopleFilterGroup = "All";
let peopleSearchText = "";
let peopleSelectedId = null;
let interactionFilterText = "";
/* The interaction details used to live in a block pinned above the name grid,
   which meant scrolling back to the top after every check. They now open as a
   popover anchored to the name you just clicked; this holds the open one. */
let interactionPopover = null;

const PEOPLE_GROUPS = ["Family", "Old friends", "School", "Work", "Dating", "Mentors", "Network", "Animals", "Unsorted"];

const PEOPLE_GROUP_COLORS = {
  Family: "var(--accent-2)",
  "Old friends": "var(--good)",
  School: "var(--accent-3)",
  Work: "var(--accent)",
  Dating: "var(--overdue)",
  Mentors: "var(--accent-2)",
  Network: "var(--accent-3)",
  Animals: "var(--good)",
  Unsorted: "var(--muted)"
};

/* First-run grouping for the names already in the survey. Empty here: a copy
   of this app has no idea who anyone is, so everyone starts Unsorted and one
   tag edit in the Rolodex puts them on a shelf. Fill this in if you would
   rather seed your own groups. */
const SEED_PERSON_TAGS = {};

async function loadPeopleFromDisk() {
  try {
    const response = await fetch("/api/people");
    if (!response.ok) return;
    const data = await response.json();
    if (Array.isArray(data.people)) {
      peopleList = data.people;
      peopleLoaded = true;
    }
  } catch {
    // Offline is a degraded read; peopleLoaded stays false so seeding cannot
    // overwrite a registry it never saw.
  }
}

async function savePeopleToDisk() {
  try {
    const response = await fetch("/api/people", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ people: peopleList })
    });
    return response.ok;
  } catch {
    return false;
  }
}

function debouncedSavePeople() {
  clearTimeout(peopleSaveTimer);
  peopleSaveTimer = setTimeout(() => savePeopleToDisk(), 600);
}

function nextPersonId() {
  const max = peopleList
    .map((person) => Number(String(person.id || "").replace(/^p-/, "")))
    .filter(Number.isFinite)
    .reduce((highest, value) => Math.max(highest, value), 0);
  return `p-${String(max + 1).padStart(3, "0")}`;
}

function personKeys(person) {
  return [person.name, ...(person.aliases || [])].map((value) => normalize(String(value)));
}

function findPersonByDisplay(display) {
  const key = normalize(String(display || ""));
  return peopleList.find((person) => personKeys(person).includes(key)) || null;
}

function personGroup(person) {
  return person?.tags?.[0] || "Unsorted";
}

function peopleGroupOrder(groups) {
  const known = PEOPLE_GROUPS.filter((group) => groups.has(group) && group !== "Unsorted");
  const extras = [...groups].filter((group) => !PEOPLE_GROUPS.includes(group)).sort();
  return [...known, ...extras, ...(groups.has("Unsorted") ? ["Unsorted"] : [])];
}

function interactionQuestion() {
  return SCHEMA.surveys.night.find((question) => question.id === "interaction") || null;
}

function ensurePeopleSeeded() {
  if (!peopleLoaded || peopleList.length) return;
  const question = interactionQuestion();
  if (!question) return;
  const seen = new Set();
  const today = todayISO();
  for (const choice of allQuestionChoices(question, "night")) {
    const display = choiceDisplay(choice);
    const key = normalize(display);
    if (seen.has(key)) continue; // a name listed twice collapses to one record
    seen.add(key);
    const tags = SEED_PERSON_TAGS[key] || [];
    peopleList.push({ id: nextPersonId(), name: display, aliases: [], tags, notes: "", created: today, archived: false });
  }
  if (peopleList.length) savePeopleToDisk();
}

/* A choice added straight from the survey's "Add option" box has no record
   yet; give it one so it files under Unsorted instead of vanishing. */
function ensurePersonRecords(displays) {
  if (!peopleLoaded) return;
  let added = false;
  for (const display of displays) {
    if (findPersonByDisplay(display)) continue;
    peopleList.push({ id: nextPersonId(), name: display, aliases: [], tags: [], notes: "", created: todayISO(), archived: false });
    added = true;
  }
  if (added) debouncedSavePeople();
}

function readInteractionDetails(survey) {
  try {
    const parsed = JSON.parse(survey?.["interaction-details"] || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeInteractionDetails(survey, details) {
  const cleaned = {};
  for (const [name, detail] of Object.entries(details || {})) {
    const mode = detail?.mode === "call" || detail?.mode === "in-person" ? detail.mode : "";
    const note = String(detail?.note || "");
    if (mode || note.trim()) cleaned[name] = { mode, note };
  }
  if (Object.keys(cleaned).length) survey["interaction-details"] = JSON.stringify(cleaned);
  else delete survey["interaction-details"];
}

/* The global textarea rule pins min-height at 360px for the journal editor;
   these small fields override it and grow with their content instead. */
function autoGrowTextarea(textarea) {
  const grow = () => {
    textarea.style.height = "auto";
    const wanted = textarea.scrollHeight + 2;
    textarea.style.height = `${Math.min(wanted, 420)}px`;
    textarea.style.overflowY = wanted > 420 ? "auto" : "hidden";
  };
  textarea.addEventListener("input", grow);
  requestAnimationFrame(grow);
}

function interactionDetailSummary(detail) {
  if (detail?.mode === "in-person") return "In person";
  if (detail?.mode === "call") return "Call";
  return "Details";
}

function closeInteractionPopover() {
  if (!interactionPopover) return;
  const open = interactionPopover;
  interactionPopover = null;
  document.removeEventListener("pointerdown", open.onPointerDown, true);
  document.removeEventListener("keydown", open.onKeyDown, true);
  window.removeEventListener("scroll", open.onReflow, true);
  window.removeEventListener("resize", open.onReflow);
  open.element.remove();
  open.anchor?.classList.remove("has-open-detail");
  open.onClose?.();
}

function scrollParentOf(element) {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const overflow = getComputedStyle(node).overflowY;
    if (overflow === "auto" || overflow === "scroll") return node;
  }
  return null;
}

/* Fixed positioning frees the card from the survey's scroller, which also
   means the scroller can no longer clip it: once the chip has scrolled out of
   that pane the card would hang over whatever is underneath, so hide it. */
function interactionAnchorVisible(anchor) {
  const rect = anchor.getBoundingClientRect();
  if (rect.bottom <= 0 || rect.top >= window.innerHeight) return false;
  const scroller = scrollParentOf(anchor);
  if (!scroller) return true;
  const bounds = scroller.getBoundingClientRect();
  return rect.bottom > bounds.top + 2 && rect.top < bounds.bottom - 2;
}

/* Fixed-positioned so an anchor inside the survey's own scroller still lands
   the card next to the name; the scroll listener is capturing so inner
   scrollers move it too. Below the chip when it fits, above it otherwise. */
function positionInteractionPopover(element, anchor) {
  if (window.innerWidth <= 640) {
    // A sheet is pinned to the screen, not to the chip, so scrolling the list
    // away from the name it belongs to must not take the sheet with it.
    element.classList.add("is-sheet");
    element.classList.remove("is-offscreen");
    element.style.left = "";
    element.style.top = "";
    return;
  }
  element.classList.remove("is-sheet");
  element.classList.toggle("is-offscreen", !interactionAnchorVisible(anchor));
  const margin = 8;
  const gap = 6;
  const rect = anchor.getBoundingClientRect();
  const box = element.getBoundingClientRect();
  const left = Math.max(margin, Math.min(rect.left, window.innerWidth - box.width - margin));
  let top = rect.bottom + gap;
  if (top + box.height > window.innerHeight - margin) {
    const above = rect.top - box.height - gap;
    top = above >= margin ? above : Math.max(margin, window.innerHeight - box.height - margin);
  }
  element.style.left = `${left}px`;
  element.style.top = `${top}px`;
}

/* onChange fires after every edit so the caller can refresh the name chip's
   summary badge without rebuilding the grid out from under the open card. */
function openInteractionPopover({ name, anchor, survey, onChange, onClose }) {
  closeInteractionPopover();

  const element = document.createElement("div");
  element.className = "interaction-popover";
  element.tabIndex = -1;
  element.setAttribute("role", "dialog");
  element.setAttribute("aria-label", `Details for ${name}`);

  const head = document.createElement("div");
  head.className = "interaction-popover-head";
  const label = document.createElement("span");
  label.className = "interaction-detail-name";
  label.textContent = name;
  const close = document.createElement("button");
  close.type = "button";
  close.className = "interaction-popover-close";
  close.setAttribute("aria-label", "Close");
  close.textContent = "×";
  close.addEventListener("click", () => closeInteractionPopover());
  head.append(label, close);

  const commit = (mutate) => {
    const current = readInteractionDetails(survey);
    const entry = current[name] || { mode: "", note: "" };
    mutate(entry);
    current[name] = entry;
    writeInteractionDetails(survey, current);
    debouncedSave();
    onChange?.();
  };

  const pills = document.createElement("div");
  pills.className = "interaction-mode-pills";
  const paintPills = () => {
    const mode = readInteractionDetails(survey)[name]?.mode || "";
    for (const pill of pills.children) pill.classList.toggle("active", pill.dataset.mode === mode);
  };
  for (const [mode, text] of [["in-person", "In person"], ["call", "Call"]]) {
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "interaction-mode-pill";
    pill.dataset.mode = mode;
    pill.textContent = text;
    pill.addEventListener("click", () => {
      commit((entry) => {
        entry.mode = entry.mode === mode ? "" : mode;
      });
      paintPills();
      renderOutputs();
    });
    pills.append(pill);
  }
  paintPills();

  const note = document.createElement("textarea");
  note.className = "interaction-note";
  note.rows = 2;
  note.placeholder = "What happened?";
  note.value = readInteractionDetails(survey)[name]?.note || "";
  note.addEventListener("input", () => {
    commit((entry) => {
      entry.note = note.value;
    });
    scheduleOutputs();
  });
  autoGrowTextarea(note);

  element.append(head, pills, note);
  document.body.append(element);
  positionInteractionPopover(element, anchor);
  anchor.classList.add("has-open-detail");
  element.focus({ preventScroll: true });

  const onPointerDown = (event) => {
    if (element.contains(event.target) || anchor.contains(event.target)) return;
    closeInteractionPopover();
  };
  const onKeyDown = (event) => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    closeInteractionPopover();
  };
  const onReflow = () => {
    // A view swap or a form re-render can pull the chip out from under us.
    if (!anchor.isConnected) closeInteractionPopover();
    else positionInteractionPopover(element, anchor);
  };
  document.addEventListener("pointerdown", onPointerDown, true);
  document.addEventListener("keydown", onKeyDown, true);
  window.addEventListener("scroll", onReflow, true);
  window.addEventListener("resize", onReflow);

  interactionPopover = { name, element, anchor, onPointerDown, onKeyDown, onReflow, onClose };
}

function shortDate(dateString) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateString || ""))) return String(dateString || "");
  return new Date(`${dateString}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function personStats(person) {
  const keys = new Set(personKeys(person));
  const dates = [];
  for (const date of Object.keys(state.entries)) {
    const names = splitAnswer(state.entries[date]?.night?.survey?.interaction);
    if (names.some((name) => keys.has(normalize(name)))) dates.push(date);
  }
  dates.sort();
  return { days: dates.length, first: dates[0] || "", last: dates[dates.length - 1] || "", dates };
}

/* Auto-detected people -------------------------------------------------------
   By the time this list gets filled in, the day has already been written down
   twice: as actual calendar blocks, and in the daily document. Anyone named in
   either was there, so an eighty-name grid should not make the user go find
   them a third time by scrolling.

   Two rules keep the detector from quietly filing a wrong answer. A first name
   that more than one person on tonight's list answers to (three Jordans, two
   Alexes) is hoisted to the top but never ticked -- picking one would be a guess
   the user only discovers months later reading the day back. And a name is
   auto-ticked at most once per day, remembered in survey._interactionAuto:
   unticking someone the detector got wrong has to stick, or the box re-checks
   itself on the next filter keystroke. The `_` prefix keeps the marker out of
   surveyAnswerCount while still letting it ride along with a transferred
   survey, like the other autofill markers. */

const INTERACTION_AUTO_KEY = "_interactionAuto";
const INTERACTION_AUTO_GROUP = "Auto-detected today";

/* "5 Sam" -> sam; "Ravi (from class)" -> ravi;
   `Max "Ace" Rivera` -> max ace rivera. The number prefix and the
   parenthetical exist to disambiguate this picker; nobody writes them in a
   sentence, so they are not part of what we look for. Aliases count as forms:
   the registry is where "Dan (work)" and "Danny" are known to be one person. */
function personNameForms(display, person) {
  const parsed = [];
  const seen = new Set();
  for (const form of [display, person?.name, ...(person?.aliases || [])]) {
    const cleaned = normalize(String(form || ""))
      .replace(/\([^)]*\)/g, " ")
      .replace(/["\u201c\u201d]/g, " ")
      .replace(/^\s*\d+\s+/, "")
      .replace(/[^a-z0-9'\- ]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!cleaned || seen.has(cleaned)) continue;
    seen.add(cleaned);
    parsed.push({ full: cleaned, words: cleaned.split(" ").filter(Boolean) });
  }
  return parsed;
}

/* Whole word only, and deliberately no lookbehind -- this runs on the phone
   too. Three letters is the floor: "Ma" or "Li" as a bare word is noise rather
   than a mention, and those names are still caught by their full form. */
function mentionsName(normalizedText, phrase) {
  if (!normalizedText || !phrase) return false;
  if (phrase.replace(/[^a-z0-9]/g, "").length < 3) return false;
  return new RegExp(`(^|[^a-z0-9])${escapeRegExp(phrase)}([^a-z0-9]|$)`).test(normalizedText);
}

/* candidates: [{ display, person }] -- exactly the names the grid would show.
   sources: [{ key, text }] with text already normalized. Returns at most one
   hit per candidate, carrying where they were named and whether the match was
   too vague to act on. */
function detectInteractionMentions(candidates, sources) {
  const parsed = candidates.map((candidate) => ({
    display: candidate.display,
    offered: candidate.offered !== false,
    forms: personNameForms(candidate.display, candidate.person)
  }));
  /* Who answers to each bare first name. This counts archived people too, who
     are never returned as hits: say the user has three Jordans and only one is
     still on the list, so "Walked around with Jordan" is a name the app cannot
     resolve even though the grid offers exactly one candidate. Counting only
     the offered names would turn that into a confident, wrong tick. */
  const claims = new Map();
  for (const item of parsed) {
    for (const form of item.forms) {
      const first = form.words[0];
      if (!first) continue;
      if (!claims.has(first)) claims.set(first, new Set());
      claims.get(first).add(item.display);
    }
  }

  const matchedSources = (phrase) => sources.filter((source) => mentionsName(source.text, phrase)).map((source) => source.key);
  const hits = [];
  const resolvedFirsts = new Set();
  for (const item of parsed) {
    let hit = null;
    for (const form of item.forms) {
      if (form.words.length < 2) continue;
      const where = matchedSources(form.full);
      if (!where.length) continue;
      hit = { display: item.display, offered: item.offered, matched: form.full, sources: where, ambiguous: false };
      break;
    }
    if (hit) {
      // A full name settles its own first name: writing "Jordan Hale" should not
      // also drag the other two Jordans up as unresolved guesses.
      for (const form of item.forms) if (form.words[0]) resolvedFirsts.add(form.words[0]);
      hits.push(hit);
      continue;
    }
    for (const form of item.forms) {
      const first = form.words[0];
      if (!first) continue;
      const where = matchedSources(first);
      if (!where.length) continue;
      hit = { display: item.display, offered: item.offered, matched: first, sources: where, ambiguous: (claims.get(first)?.size || 0) > 1 };
      break;
    }
    if (hit) hits.push(hit);
  }
  return hits
    .filter((hit) => hit.offered !== false)
    .filter((hit) => !(hit.ambiguous && resolvedFirsts.has(hit.matched)));
}

/* The two places today is already described. Plans are deliberately left out:
   a block you meant to spend with someone is not evidence that you did. */
function interactionMentionSources(dateString) {
  const eventText = eventsForDay(dateString)
    .filter((event) => event && event.kind === "actual")
    .map((event) => [event.title, event.location, event.notes].filter(Boolean).join(" "))
    .join("\n");
  return [
    { key: "events", label: "today's events", text: normalize(eventText) },
    { key: "journal", label: "the journal", text: normalize(String(state.entries[dateString]?.journal || "")) }
  ];
}

function interactionSourceLabel(hit) {
  return hit.sources.map((key) => (key === "events" ? "today's events" : "the journal")).join(" and ");
}

function readInteractionAuto(survey) {
  try {
    const parsed = JSON.parse(survey?.[INTERACTION_AUTO_KEY] || "[]");
    return Array.isArray(parsed) ? parsed.map((name) => String(name)) : [];
  } catch {
    return [];
  }
}

function markInteractionAuto(survey, names) {
  const merged = new Set(readInteractionAuto(survey));
  for (const name of names) merged.add(name);
  survey[INTERACTION_AUTO_KEY] = JSON.stringify([...merged]);
}

function appendInteractionControl(fieldset, question, session) {
  const survey = session.survey;
  const wrap = document.createElement("div");
  wrap.className = "interaction-control";

  const tools = document.createElement("div");
  tools.className = "interaction-tools";
  const filter = document.createElement("input");
  filter.type = "search";
  filter.placeholder = "Filter people…";
  filter.value = interactionFilterText;
  filter.setAttribute("aria-label", "Filter people");
  const count = document.createElement("span");
  count.className = "interaction-count";
  const rolodexButton = document.createElement("button");
  rolodexButton.type = "button";
  rolodexButton.className = "quiet";
  rolodexButton.textContent = "Open Rolodex";
  rolodexButton.addEventListener("click", () => setView("people"));
  tools.append(filter, count, rolodexButton);

  /* Says out loud what the grid just did on its own. Silent auto-ticking would
     be indistinguishable from the user having ticked it themselves. */
  const autoNote = document.createElement("div");
  autoNote.className = "interaction-auto-note";
  autoNote.hidden = true;

  const groupsBox = document.createElement("div");
  groupsBox.className = "interaction-groups";
  /* display -> the chip's badge painter, so an edit made in the popover can
     refresh just that one name instead of rebuilding the whole grid (which
     would yank the anchor out from under the open card). */
  const chipBadges = new Map();

  const updateCount = () => {
    const selected = splitAnswer(survey[question.id]);
    count.textContent = selected.length ? `${selected.length} selected` : "No one yet";
    count.classList.toggle("has-selection", selected.length > 0);
  };

  const setAnswerFromCheckboxes = () => {
    const values = Array.from(groupsBox.querySelectorAll("input:checked")).map((input) => input.value);
    const details = readInteractionDetails(survey);
    for (const name of Object.keys(details)) {
      if (!values.includes(name)) delete details[name];
    }
    survey[question.id] = values.join(", ");
    writeInteractionDetails(survey, details);
    debouncedSave();
    renderOutputs();
    updateCount();
  };

  /* Split by what is true right now rather than by what the detector did: a
     name the user has since unticked must not keep being called ticked. */
  const paintAutoNote = (hits, selected) => {
    autoNote.innerHTML = "";
    autoNote.hidden = !hits.length;
    if (!hits.length) return;
    const chosen = new Set(selected);
    const ticked = hits.filter((hit) => !hit.ambiguous && chosen.has(hit.display));
    const declined = hits.filter((hit) => !hit.ambiguous && !chosen.has(hit.display));
    const unsure = hits.filter((hit) => hit.ambiguous);
    if (ticked.length) {
      const line = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = "Auto-detected and ticked:";
      const detail = ticked.map((hit) => `${hit.display} (named in ${interactionSourceLabel(hit)})`).join(", ");
      line.append(strong, document.createTextNode(` ${detail}. Untick anyone this got wrong — they will not be ticked again today.`));
      autoNote.append(line);
    }
    if (unsure.length) {
      const line = document.createElement("p");
      line.className = "interaction-auto-unsure";
      const names = [...new Set(unsure.map((hit) => hit.matched))].map((name) => `“${name}”`).join(", ");
      line.textContent = `Also mentioned, but more than one person you know answers to ${names}, so nothing was ticked: ${unsure.map((hit) => hit.display).join(", ")}.`;
      autoNote.append(line);
    }
    if (declined.length) {
      const line = document.createElement("p");
      line.className = "interaction-auto-unsure";
      line.textContent = `Detected today but left alone because you unticked them: ${declined.map((hit) => hit.display).join(", ")}.`;
      autoNote.append(line);
    }
  };

  const openDetails = (name, anchor) => {
    openInteractionPopover({
      name,
      anchor,
      survey,
      onChange: () => chipBadges.get(name)?.(),
      onClose: () => chipBadges.get(name)?.()
    });
  };

  const rebuildGroups = () => {
    closeInteractionPopover();
    chipBadges.clear();
    groupsBox.innerHTML = "";
    const selected = splitAnswer(survey[question.id]);
    const needle = normalize(interactionFilterText.trim());
    const seen = new Set();
    /* The roster is who is on tonight's list; `visible` is what survives the
       filter box. Detection has to read the roster: narrowing to "jor" would
       otherwise hide the second Jordan and turn a name we refuse to guess at
       into a confident tick. */
    const roster = [];
    for (const choice of questionChoices(question, state.session)) {
      const display = choiceDisplay(choice);
      const key = normalize(display);
      if (seen.has(key)) continue; // duplicate choice strings render once
      seen.add(key);
      const person = findPersonByDisplay(display);
      if (person?.archived && !selected.includes(display)) continue;
      roster.push({ display, person, key });
    }
    ensurePersonRecords(roster.filter((item) => !item.person).map((item) => item.display));
    const visible = needle ? roster.filter((item) => item.key.includes(needle)) : roster;

    /* Only names the grid offers can be ticked, so an archived person stays
       gone even on a day that mentions them. They still go into the pool,
       flagged unofferable, because they are what makes a first name ambiguous:
       "Jordan" is unresolvable whether or not the other two Jordans are retired. */
    const rostered = new Set(roster.map((item) => normalize(item.display)));
    const candidates = roster.map((item) => ({
      display: item.display,
      person: item.person || findPersonByDisplay(item.display)
    }));
    for (const person of peopleList) {
      if (personKeys(person).some((key) => rostered.has(key))) continue;
      candidates.push({ display: person.name, person, offered: false });
    }
    const hits = detectInteractionMentions(candidates, interactionMentionSources(state.currentDate));
    const alreadyAuto = new Set(readInteractionAuto(survey));
    const fresh = hits.filter((hit) => !hit.ambiguous && !alreadyAuto.has(hit.display) && !selected.includes(hit.display));
    if (fresh.length) {
      for (const hit of fresh) selected.push(hit.display);
      survey[question.id] = selected.join(", ");
      markInteractionAuto(survey, fresh.map((hit) => hit.display));
      debouncedSave();
      updateCount();
      // Deferred on purpose: renderOutputs() from here rebuilds a panel this
      // call is still in the middle of feeding.
      scheduleOutputs();
    }
    paintAutoNote(hits, selected);

    const shown = new Set(visible.map((item) => item.display));
    const shownHits = hits.filter((hit) => shown.has(hit.display));
    const hitByDisplay = new Map(shownHits.map((hit) => [hit.display, hit]));
    const groups = new Map();
    for (const item of visible) {
      if (hitByDisplay.has(item.display)) continue; // hoisted into the auto group instead
      const group = personGroup(item.person || findPersonByDisplay(item.display));
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(item.display);
    }
    const sections = peopleGroupOrder(new Set(groups.keys()))
      .map((group) => ({ name: group, displays: groups.get(group), auto: false }));
    if (shownHits.length) sections.unshift({ name: INTERACTION_AUTO_GROUP, displays: shownHits.map((hit) => hit.display), auto: true });
    for (const { name: group, displays, auto } of sections) {
      const section = document.createElement("div");
      section.className = auto ? "interaction-group is-auto" : "interaction-group";
      const head = document.createElement("div");
      head.className = "interaction-group-head";
      const nameSpan = document.createElement("span");
      nameSpan.className = "interaction-group-name";
      nameSpan.textContent = group;
      const countSpan = document.createElement("span");
      countSpan.className = "interaction-group-count";
      countSpan.textContent = String(displays.length);
      head.append(nameSpan, countSpan);
      const list = document.createElement("div");
      list.className = "choice-grid long-choice-grid";
      for (const display of displays) {
        const label = document.createElement("label");
        label.className = selected.includes(display) ? "choice-option is-checked" : "choice-option";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = `survey-${question.id}`;
        input.value = display;
        input.checked = selected.includes(display);
        label.append(input, document.createTextNode(display));

        /* The badge doubles as the way back in: checking someone pops the
           card open, and this reopens it later without toggling them off. */
        const badge = document.createElement("button");
        badge.type = "button";
        badge.className = "interaction-chip-detail";
        badge.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (interactionPopover?.name === display) closeInteractionPopover();
          else openDetails(display, label);
        });
        const paintBadge = () => {
          badge.hidden = !input.checked;
          if (!input.checked) return;
          const detail = readInteractionDetails(survey)[display] || { mode: "", note: "" };
          badge.textContent = interactionDetailSummary(detail);
          badge.classList.toggle("is-set", Boolean(detail.mode));
          badge.classList.toggle("has-note", Boolean(String(detail.note || "").trim()));
          badge.title = `Details for ${display}`;
          badge.setAttribute("aria-label", `Details for ${display}`);
        };
        chipBadges.set(display, paintBadge);
        paintBadge();
        label.append(badge);

        input.addEventListener("change", () => {
          label.classList.toggle("is-checked", input.checked);
          setAnswerFromCheckboxes();
          paintBadge();
          if (input.checked) openDetails(display, label);
          else if (interactionPopover?.name === display) closeInteractionPopover();
        });
        const hit = hitByDisplay.get(display);
        if (hit) {
          label.classList.add("is-auto-detected");
          if (hit.ambiguous) label.classList.add("is-auto-unsure");
          label.title = hit.ambiguous
            ? `“${hit.matched}” appears in ${interactionSourceLabel(hit)}, but more than one person you know answers to it — tick the right one yourself.`
            : `Auto-detected: “${hit.matched}” appears in ${interactionSourceLabel(hit)}.`;
        }
        const dot = document.createElement("span");
        dot.className = "interaction-group-dot";
        // Read off the person, not the section: in the auto group the heading
        // no longer says which shelf they came from.
        dot.style.background = PEOPLE_GROUP_COLORS[personGroup(findPersonByDisplay(display))] || "var(--muted)";
        label.append(dot);
        if (surveyEditMode) {
          // For a person the × archives rather than plain-removes, so the
          // Rolodex and this list never disagree about who is still around:
          // a bare removeSurveyChoice would leave an active profile behind
          // with no way to put the name back except retyping it.
          const person = findPersonByDisplay(display);
          const remove = document.createElement("button");
          remove.type = "button";
          remove.className = "choice-remove";
          remove.title = person
            ? `Archive "${display}" — hidden from ${formatDateLine(state.currentDate)} onward, restorable in the Rolodex`
            : `Remove "${display}" from ${formatDateLine(state.currentDate)} onward`;
          remove.setAttribute("aria-label", person ? `Archive ${display}` : `Remove option ${display}`);
          remove.textContent = "×";
          remove.addEventListener("click", (event) => {
            event.preventDefault();
            if (!person) {
              removeSurveyChoice(question, display);
              return;
            }
            if (!confirm(`Archive "${display}"?

They drop off this list from ${formatDateLine(state.currentDate)} onward. Earlier days keep them, nothing logged is lost, and the Rolodex's Archived chip puts them back.`)) return;
            setPersonArchived(person, true);
            renderSurveyForm();
            renderOutputs();
          });
          label.append(remove);
        }
        list.append(label);
      }
      section.append(head, list);
      groupsBox.append(section);
    }
  };

  filter.addEventListener("input", () => {
    interactionFilterText = filter.value;
    rebuildGroups();
  });

  updateCount();
  rebuildGroups();
  wrap.append(tools, autoNote, groupsBox);
  fieldset.append(wrap);
  appendAddChoiceControl(fieldset, question, session);
}

/* The name field auto-saves while the profile is open, so a rename must be
   replayable: pausing at "Mom," on the way to "Mommy" may not leave a stray
   alias, custom choice, or history key behind. The session remembers the name
   the profile OPENED with; every commit re-derives from that origin, undoing
   whatever the previous commit created first. */
let renameSession = null;

function ensureRenameSession(person) {
  if (renameSession?.personId !== person.id) {
    renameSession = {
      personId: person.id,
      origin: person.name,
      originHadHistory: choiceHistoryFor("night", "interaction", person.name).length > 0,
      intermediate: null
    };
  }
  return renameSession;
}

function rewriteTodayInteractionName(oldName, newName) {
  const session = state.entries[state.currentDate]?.night;
  if (!session?.survey) return;
  const values = splitAnswer(session.survey.interaction).map((value) => (normalize(value) === normalize(oldName) ? newName : value));
  if (values.length) session.survey.interaction = values.join(", ");
  const details = readInteractionDetails(session.survey);
  if (details[oldName] && oldName !== newName) {
    details[newName] = details[oldName];
    delete details[oldName];
    writeInteractionDetails(session.survey, details);
  }
}

function renamePerson(person, newNameRaw) {
  const newName = String(newNameRaw || "").trim();
  if (!newName) return "empty";
  if (newName === person.name) return "noop";
  if (peopleList.some((other) => other !== person && personKeys(other).includes(normalize(newName)))) return "conflict";
  const session = ensureRenameSession(person);
  const prev = person.name;
  if (session.intermediate) {
    const im = session.intermediate;
    const customList = state.customChoices.night?.interaction || [];
    const index = customList.findIndex((choice) => normalize(choice.display) === normalize(im.display));
    if (im.createdChoice && index !== -1) customList.splice(index, 1);
    if (im.createdHistoryKey) delete state.customChoices.choiceHistory.night.interaction?.[normalize(im.display)];
    else recordChoiceEvent("night", "interaction", im.display, state.currentDate, "remove");
    session.intermediate = null;
  }
  if (normalize(newName) === normalize(session.origin)) {
    // Typed back to where the profile started: leave no trace of the detour.
    if (session.originHadHistory) recordChoiceEvent("night", "interaction", session.origin, state.currentDate, "add");
    else delete state.customChoices.choiceHistory.night.interaction?.[normalize(session.origin)];
    person.aliases = person.aliases.filter((alias) => normalize(alias) !== normalize(session.origin));
    person.name = session.origin;
  } else {
    /* The choice list swaps displays from today onward; earlier days keep the
       old string in their answers, which still counts for this person because
       the origin name stays on the record as an alias. */
    recordChoiceEvent("night", "interaction", session.origin, state.currentDate, "remove");
    const question = interactionQuestion();
    const existedAsChoice = question
      ? allQuestionChoices(question, "night").some((choice) => normalize(choiceDisplay(choice)) === normalize(newName))
      : false;
    const hadHistory = choiceHistoryFor("night", "interaction", newName).length > 0;
    addPersistentChoice("night", "interaction", newName, { effectiveFrom: state.currentDate });
    session.intermediate = { display: newName, createdChoice: !existedAsChoice, createdHistoryKey: !hadHistory };
    if (!person.aliases.some((alias) => normalize(alias) === normalize(session.origin))) person.aliases.push(session.origin);
    person.name = newName;
  }
  rewriteTodayInteractionName(prev, person.name);
  saveCustomChoices();
  saveEverywhere();
  debouncedSavePeople();
  return "ok";
}

function mergePeople(keptId, absorbedId) {
  const kept = peopleList.find((person) => person.id === keptId);
  const absorbed = peopleList.find((person) => person.id === absorbedId);
  if (!kept || !absorbed || kept === absorbed) return;
  for (const alias of [absorbed.name, ...absorbed.aliases]) {
    if (!personKeys(kept).includes(normalize(alias))) kept.aliases.push(alias);
  }
  for (const tag of absorbed.tags) {
    if (!kept.tags.includes(tag)) kept.tags.push(tag);
  }
  if (absorbed.notes.trim()) kept.notes = kept.notes.trim() ? `${kept.notes.trim()}\n${absorbed.notes.trim()}` : absorbed.notes;
  if (normalize(absorbed.name) !== normalize(kept.name)) {
    recordChoiceEvent("night", "interaction", absorbed.name, state.currentDate, "remove");
  }
  peopleList = peopleList.filter((person) => person.id !== absorbed.id);
  peopleSelectedId = kept.id;
  saveCustomChoices();
  saveEverywhere();
  savePeopleToDisk();
}

function setPersonArchived(person, archived) {
  person.archived = archived === true;
  if (person.archived) recordChoiceEvent("night", "interaction", person.name, state.currentDate, "remove");
  else recordChoiceEvent("night", "interaction", person.name, state.currentDate, "add");
  saveCustomChoices();
  saveEverywhere();
  savePeopleToDisk();
}

function renderPeopleView(force = false) {
  // Same focus contract as renderLearnView: an unrelated
  // render must never rebuild while one of these fields has focus.
  if (!force && els.peopleView.contains(document.activeElement) && document.activeElement?.matches?.("input, textarea")) {
    return;
  }
  els.peopleView.innerHTML = "";
  const selected = peopleSelectedId ? peopleList.find((person) => person.id === peopleSelectedId) : null;
  if (selected) {
    renderPersonProfile(selected);
    return;
  }
  peopleSelectedId = null;

  const toolbar = document.createElement("div");
  toolbar.className = "learn-toolbar";
  const summary = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = "Rolodex";
  const status = document.createElement("p");
  const active = peopleList.filter((person) => !person.archived);
  status.textContent = peopleList.length ? `${active.length} people${peopleList.length > active.length ? ` · ${peopleList.length - active.length} archived` : ""}` : "No people yet. They seed from the night survey's list.";
  summary.append(title, status);
  const actions = document.createElement("div");
  actions.className = "learn-toolbar-actions";
  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.textContent = "+ New person";
  addButton.addEventListener("click", () => {
    const name = prompt("Name of the new person:");
    const trimmed = String(name || "").trim();
    if (!trimmed) return;
    if (findPersonByDisplay(trimmed)) {
      alert(`"${trimmed}" is already in the Rolodex.`);
      return;
    }
    const question = interactionQuestion();
    if (question) addPersistentChoice("night", "interaction", trimmed, { effectiveFrom: state.currentDate });
    const person = { id: nextPersonId(), name: trimmed, aliases: [], tags: [], notes: "", created: todayISO(), archived: false };
    peopleList.push(person);
    peopleSelectedId = person.id;
    saveCustomChoices();
    savePeopleToDisk();
    renderPeopleView(true);
  });
  actions.append(addButton);
  toolbar.append(summary, actions);
  els.peopleView.append(toolbar);

  const search = document.createElement("input");
  search.type = "search";
  search.className = "people-search";
  search.placeholder = "Search people, tags, notes…";
  search.value = peopleSearchText;
  search.addEventListener("input", () => {
    peopleSearchText = search.value;
    renderPeopleView();
  });
  els.peopleView.append(search);

  // Archived people are hidden from every group section, so the Archived chip
  // is the only route back to their profile. It exists only when it has
  // something to show, and never stays selected once the last one is restored.
  const archivedList = peopleList.filter((person) => person.archived);
  if (peopleFilterGroup === "Archived" && !archivedList.length) peopleFilterGroup = "All";
  const viewingArchived = peopleFilterGroup === "Archived";
  const groupsPresent = new Set(active.flatMap((person) => (person.tags.length ? person.tags : ["Unsorted"])));
  const chipNames = ["All", ...peopleGroupOrder(groupsPresent)];
  if (archivedList.length) chipNames.push(`Archived`);
  const chips = document.createElement("div");
  chips.className = "people-chips";
  for (const group of chipNames) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = peopleFilterGroup === group ? "people-chip active" : "people-chip";
    chip.textContent = group === "Archived" ? `Archived · ${archivedList.length}` : group;
    chip.addEventListener("click", () => {
      peopleFilterGroup = group;
      renderPeopleView(true);
    });
    chips.append(chip);
  }
  els.peopleView.append(chips);

  // Two records answering to the same name is exactly the duplicate-choice bug;
  // surface it instead of waiting for someone to notice doubled rows.
  const byName = new Map();
  for (const person of peopleList) {
    const key = normalize(person.name);
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key).push(person);
  }
  for (const [, dupes] of byName) {
    if (dupes.length < 2) continue;
    const banner = document.createElement("div");
    banner.className = "people-duplicate-banner";
    const text = document.createElement("span");
    text.textContent = `Possible duplicate: "${dupes[0].name}" has ${dupes.length} profiles.`;
    const mergeButton = document.createElement("button");
    mergeButton.type = "button";
    mergeButton.className = "quiet";
    mergeButton.textContent = "Merge them";
    mergeButton.addEventListener("click", () => {
      const [kept, ...rest] = [...dupes].sort((a, b) => String(a.created).localeCompare(String(b.created)));
      if (!confirm(`Merge ${dupes.length} "${kept.name}" profiles into one? Every logged day from all of them counts for the kept profile.`)) return;
      for (const extra of rest) mergePeople(kept.id, extra.id);
      renderPeopleView(true);
    });
    banner.append(text, mergeButton);
    els.peopleView.append(banner);
  }

  const needle = normalize(peopleSearchText.trim());
  const matches = (person) => {
    if (!needle) return true;
    const haystack = [person.name, ...person.aliases, ...person.tags, person.notes].join(" ");
    return normalize(haystack).includes(needle);
  };
  // Every tag is a section, so a person with several tags appears under each;
  // an active chip narrows the page to that one section.
  const personSections = (person) => (person.tags.length ? person.tags : ["Unsorted"]);
  const shown = (viewingArchived ? archivedList : active).filter(
    (person) => matches(person) && (viewingArchived || peopleFilterGroup === "All" || personSections(person).includes(peopleFilterGroup))
  );
  const grouped = new Map();
  for (const person of shown) {
    for (const group of personSections(person)) {
      if (!viewingArchived && peopleFilterGroup !== "All" && group !== peopleFilterGroup) continue;
      if (!grouped.has(group)) grouped.set(group, []);
      grouped.get(group).push(person);
    }
  }
  for (const group of peopleGroupOrder(new Set(grouped.keys()))) {
    const section = document.createElement("div");
    section.className = "people-group";
    const head = document.createElement("div");
    head.className = "people-group-head";
    head.textContent = `${group} · ${grouped.get(group).length}`;
    section.append(head);
    const people = grouped.get(group).sort((a, b) => a.name.localeCompare(b.name));
    for (const person of people) {
      section.append(personRow(person, group));
    }
    els.peopleView.append(section);
  }
  if (!shown.length && peopleList.length) {
    const empty = document.createElement("p");
    empty.className = "people-empty";
    empty.textContent = viewingArchived ? "No archived person matches." : "No one matches.";
    els.peopleView.append(empty);
  }
  // Searching for someone you archived and being told "No one matches" is the
  // trap this catches: say where they went, and offer the one click there.
  if (!viewingArchived && needle) {
    const hidden = archivedList.filter(matches).length;
    if (hidden) {
      const hint = document.createElement("p");
      hint.className = "people-empty";
      hint.textContent = `${hidden} archived ${hidden === 1 ? "person matches" : "people match"} "${peopleSearchText.trim()}". `;
      const jump = document.createElement("button");
      jump.type = "button";
      jump.className = "quiet";
      jump.textContent = "Show archived";
      jump.addEventListener("click", () => {
        peopleFilterGroup = "Archived";
        renderPeopleView(true);
      });
      hint.append(jump);
      els.peopleView.append(hint);
    }
  }
}

function personRow(person, group) {
  const row = document.createElement("div");
  row.className = person.archived ? "people-row is-archived" : "people-row";
  const open = document.createElement("button");
  open.type = "button";
  open.className = "people-row-open";
  const avatar = document.createElement("span");
  avatar.className = "people-avatar";
  avatar.style.background = PEOPLE_GROUP_COLORS[group] || "var(--muted)";
  avatar.textContent = person.name
    .replace(/^\d+\s+/, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");
  const main = document.createElement("span");
  main.className = "people-row-main";
  const name = document.createElement("span");
  name.className = "people-row-name";
  name.textContent = person.name;
  const stats = personStats(person);
  const meta = document.createElement("span");
  meta.className = "people-row-meta";
  meta.textContent = stats.days
    ? `Seen ${stats.days} day${stats.days === 1 ? "" : "s"} · last ${shortDate(stats.last)}`
    : "Not logged yet";
  main.append(name, meta);
  const tags = document.createElement("span");
  tags.className = "people-row-tags";
  for (const tag of person.tags.slice(0, 3)) {
    const chipEl = document.createElement("span");
    chipEl.className = "people-tag";
    chipEl.textContent = tag;
    tags.append(chipEl);
  }
  open.append(avatar, main, tags);
  open.addEventListener("click", () => {
    peopleSelectedId = person.id;
    renderPeopleView(true);
  });
  // Archiving is the crowd control for the night survey's people list, so it
  // belongs on the row: opening 30 profiles to tidy the list is why it went
  // unused. Restore sits in the same place under the Archived chip.
  const archive = document.createElement("button");
  archive.type = "button";
  archive.className = "quiet people-row-archive";
  archive.textContent = person.archived ? "Restore" : "Archive";
  archive.title = person.archived
    ? `Put "${person.name}" back in the night survey's list`
    : `Hide "${person.name}" from the night survey's list. Days already logged keep counting.`;
  archive.addEventListener("click", () => {
    setPersonArchived(person, !person.archived);
    renderPeopleView(true);
  });
  row.append(open, archive);
  return row;
}

function renderPersonProfile(person) {
  const back = document.createElement("button");
  back.type = "button";
  back.className = "quiet people-back";
  back.textContent = "‹ Rolodex";
  back.addEventListener("click", () => {
    peopleSelectedId = null;
    renderPeopleView(true);
  });
  els.peopleView.append(back);

  const card = document.createElement("div");
  card.className = "people-profile";

  const headRow = document.createElement("div");
  headRow.className = "people-profile-head";
  const avatar = document.createElement("span");
  avatar.className = "people-avatar people-avatar-large";
  avatar.style.background = PEOPLE_GROUP_COLORS[personGroup(person)] || "var(--muted)";
  avatar.textContent = person.name
    .replace(/^\d+\s+/, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");
  const nameBox = document.createElement("div");
  nameBox.className = "people-name-box";
  const nameRow = document.createElement("div");
  nameRow.className = "people-name-row";
  ensureRenameSession(person);
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.value = person.name;
  nameInput.className = "people-name-input";
  const renameStatus = document.createElement("span");
  renameStatus.className = "people-rename-status";
  let renameTimer = null;
  const commitRename = () => {
    clearTimeout(renameTimer);
    const result = renamePerson(person, nameInput.value);
    if (result === "ok") renameStatus.textContent = "Saved";
    else if (result === "conflict") renameStatus.textContent = "Another person has that name";
    else if (result === "empty") renameStatus.textContent = "A name can't be empty";
    else renameStatus.textContent = "";
    renameStatus.classList.toggle("is-problem", result === "conflict" || result === "empty");
  };
  nameInput.addEventListener("input", () => {
    clearTimeout(renameTimer);
    renameTimer = setTimeout(commitRename, 800);
  });
  nameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitRename();
    }
  });
  nameInput.addEventListener("blur", () => {
    commitRename();
    // Refresh the alias line and list row once focus has settled elsewhere --
    // immediately would rebuild the button the blur-causing click is aimed at.
    setTimeout(() => renderPeopleView(), 200);
  });
  nameRow.append(nameInput, renameStatus);
  const idLine = document.createElement("p");
  idLine.className = "people-id-line";
  idLine.innerHTML = `ID <code>${person.id}</code> · renames auto-save and keep this ID, so past days stay linked`;
  nameBox.append(nameRow, idLine);
  headRow.append(avatar, nameBox);
  card.append(headRow);

  if (person.aliases.length) {
    const aliases = document.createElement("p");
    aliases.className = "people-aliases";
    aliases.textContent = `Also logged as: ${person.aliases.join(", ")}`;
    card.append(aliases);
  }

  const tagsLabel = document.createElement("div");
  tagsLabel.className = "people-field-label";
  tagsLabel.textContent = "Tags";
  card.append(tagsLabel);
  const tagsRow = document.createElement("div");
  tagsRow.className = "people-tags-row";
  person.tags.forEach((tag, index) => {
    const chipEl = document.createElement("span");
    chipEl.className = index === 0 ? "people-tag people-tag-primary" : "people-tag";
    chipEl.textContent = tag;
    const removeTag = document.createElement("button");
    removeTag.type = "button";
    removeTag.className = "people-tag-remove";
    removeTag.setAttribute("aria-label", `Remove tag ${tag}`);
    removeTag.textContent = "×";
    removeTag.addEventListener("click", () => {
      person.tags.splice(index, 1);
      savePeopleToDisk();
      renderPeopleView(true);
    });
    chipEl.append(removeTag);
    tagsRow.append(chipEl);
  });
  const tagInput = document.createElement("input");
  tagInput.type = "text";
  tagInput.className = "people-tag-input";
  tagInput.placeholder = "+ Add tag…";
  const addTag = (rawValue) => {
    const value = String(rawValue ?? tagInput.value).trim();
    if (!value) return;
    if (!person.tags.some((tag) => normalize(tag) === normalize(value))) {
      person.tags.push(value);
      savePeopleToDisk();
    }
    tagInput.value = "";
    renderPeopleView(true);
  };
  tagInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag();
    }
  });
  tagsRow.append(tagInput);
  card.append(tagsRow);
  /* Known tags as small clickable chips, not a <datalist> -- the native popup
     renders at the OS's autofill size and cannot be styled down. */
  const knownTags = new Set([...PEOPLE_GROUPS.filter((group) => group !== "Unsorted"), ...peopleList.flatMap((entry) => entry.tags)]);
  const suggestions = [...knownTags]
    .filter((tag) => !person.tags.some((tagOnPerson) => normalize(tagOnPerson) === normalize(tag)))
    .sort((a, b) => {
      const groupDelta = Number(PEOPLE_GROUPS.includes(b)) - Number(PEOPLE_GROUPS.includes(a));
      return groupDelta || a.localeCompare(b);
    });
  if (suggestions.length) {
    const suggestRow = document.createElement("div");
    suggestRow.className = "people-tag-suggestions";
    for (const tag of suggestions.slice(0, 14)) {
      const suggest = document.createElement("button");
      suggest.type = "button";
      suggest.className = "people-tag-suggestion";
      suggest.textContent = tag;
      suggest.addEventListener("click", () => addTag(tag));
      suggestRow.append(suggest);
    }
    card.append(suggestRow);
  }
  const tagHint = document.createElement("p");
  tagHint.className = "people-id-line";
  tagHint.textContent = "They appear under every tag in the Rolodex; the first tag is where they file in the night survey.";
  card.append(tagHint);

  const notesLabel = document.createElement("div");
  notesLabel.className = "people-field-label";
  notesLabel.textContent = "Notes";
  card.append(notesLabel);
  const notes = document.createElement("textarea");
  notes.className = "people-notes";
  notes.rows = 3;
  notes.placeholder = "How you met, context, anything worth remembering…";
  notes.value = person.notes;
  notes.addEventListener("input", () => {
    person.notes = notes.value;
    debouncedSavePeople();
  });
  autoGrowTextarea(notes);
  card.append(notes);

  const stats = personStats(person);
  const statsRow = document.createElement("div");
  statsRow.className = "people-stats-row";
  const statBoxes = [
    [String(stats.days), "days interacted"],
    [stats.last ? shortDate(stats.last) : "—", "last seen"],
    [stats.first ? shortDate(stats.first) : "—", "first logged"]
  ];
  for (const [value, label] of statBoxes) {
    const box = document.createElement("div");
    box.className = "people-stat";
    const num = document.createElement("span");
    num.className = "people-stat-value";
    num.textContent = value;
    const lab = document.createElement("span");
    lab.className = "people-stat-label";
    lab.textContent = label;
    box.append(num, lab);
    statsRow.append(box);
  }
  card.append(statsRow);

  if (stats.dates.length) {
    const recentLabel = document.createElement("div");
    recentLabel.className = "people-field-label";
    recentLabel.textContent = "Recent interactions";
    card.append(recentLabel);
    const list = document.createElement("div");
    list.className = "people-recent";
    const keys = new Set(personKeys(person));
    for (const date of [...stats.dates].reverse().slice(0, 6)) {
      const row = document.createElement("div");
      row.className = "people-recent-row";
      const when = document.createElement("span");
      when.className = "people-recent-date";
      when.textContent = shortDate(date);
      const what = document.createElement("span");
      const details = readInteractionDetails(state.entries[date]?.night?.survey);
      const detailKey = Object.keys(details).find((name) => keys.has(normalize(name)));
      const detail = detailKey ? details[detailKey] : null;
      const mode = detail?.mode === "call" ? "Call" : detail?.mode === "in-person" ? "In person" : "";
      const note = String(detail?.note || "").trim();
      what.textContent = [mode, note].filter(Boolean).join(" — ") || "Night survey";
      row.append(when, what);
      list.append(row);
    }
    card.append(list);
  }

  const actionsRow = document.createElement("div");
  actionsRow.className = "people-actions-row";
  const others = peopleList.filter((entry) => entry.id !== person.id && !entry.archived).sort((a, b) => a.name.localeCompare(b.name));
  if (others.length) {
    const mergeSelect = document.createElement("select");
    mergeSelect.className = "people-merge-select";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Merge another profile into this one…";
    mergeSelect.append(placeholder);
    for (const other of others) {
      const option = document.createElement("option");
      option.value = other.id;
      option.textContent = `${other.name} (${other.id})`;
      mergeSelect.append(option);
    }
    mergeSelect.addEventListener("change", () => {
      const other = peopleList.find((entry) => entry.id === mergeSelect.value);
      if (!other) return;
      if (confirm(`Merge "${other.name}" into "${person.name}"? Every day logged for either counts for the kept profile; nothing is deleted from any entry.`)) {
        mergePeople(person.id, other.id);
        renderPeopleView(true);
      } else {
        mergeSelect.value = "";
      }
    });
    actionsRow.append(mergeSelect);
  }
  const archiveButton = document.createElement("button");
  archiveButton.type = "button";
  archiveButton.className = "quiet people-archive";
  archiveButton.textContent = person.archived ? "Unarchive" : "Archive";
  archiveButton.addEventListener("click", () => {
    setPersonArchived(person, !person.archived);
    renderPeopleView(true);
  });
  actionsRow.append(archiveButton);
  card.append(actionsRow);

  els.peopleView.append(card);
}

async function loadGoalsFromDisk() {
  // Cleared up front so the flag always describes the doc currently in hand: a
  // reload that fails must not leave a stale "this came from the server" behind
  // and let persistGoalsDoc write a cached copy back.
  goalsDocLoaded = false;
  try {
    const response = await fetch("/api/goals");
    if (!response.ok) throw new Error(`goals ${response.status}`);
    const doc = await response.json();
    if (!doc || !Array.isArray(doc.goals)) throw new Error("goals payload has no goals array");
    goalsDoc = doc;
    goalsDocLoaded = true;
    cacheGoalsDoc();
    return;
  } catch {
    // Offline, or the server is down. Fall through to the last good copy.
  }
  try {
    const cached = JSON.parse(localStorage.getItem(GOALS_CACHE_KEY));
    if (cached && Array.isArray(cached.goals)) goalsDoc = cached;
  } catch {
    // No usable cache: goal surfaces render empty and say why rather than
    // claiming the schedule is empty.
  }
}

function cacheGoalsDoc() {
  try {
    localStorage.setItem(GOALS_CACHE_KEY, JSON.stringify(goalsDoc));
  } catch {
    // Quota, or storage disabled. The live doc is already in hand.
  }
}

async function loadGoalLogFromDisk() {
  try {
    const response = await fetch("/api/goal-log");
    if (!response.ok) return;
    const data = await response.json();
    if (Array.isArray(data.events)) goalLog = data.events;
  } catch {
    // Same: offline is a degraded read, not a failure.
  }
  // Rows queued while the server was unreachable are part of the log this
  // client knows about, whether or not they have reached disk yet — without
  // this, a reload while offline would show yesterday's tick undone.
  const queued = readGoalEventQueue();
  if (queued.length) {
    const known = new Set(goalLog.map((event) => event.id));
    for (const row of queued) {
      if (!known.has(row.id)) goalLog.push(row);
    }
  }
}

/* --- Offline goal-event queue ------------------------------------------------

   The GOALS_PLAN Phase 2 write queue. A goal event that cannot reach the server
   parks in localStorage and is replayed later: POST /api/goal-log skips ids it
   already stored, so a replay is idempotent, and the append-only design means
   there is no merge to get wrong. Flush runs at boot, when the network comes
   back, when the tab becomes visible, and on a slow timer while anything is
   queued — the phone case this exists for is "captured on the subway, landed
   when the laptop was reachable again".
--------------------------------------------------------------------------- */

const GOAL_EVENT_QUEUE_KEY = "aa-journal-goal-queue-v1";
let goalQueueFlushTimer = null;

function readGoalEventQueue() {
  try {
    const queue = JSON.parse(localStorage.getItem(GOAL_EVENT_QUEUE_KEY));
    return Array.isArray(queue) ? queue : [];
  } catch {
    return [];
  }
}

function writeGoalEventQueue(queue) {
  try {
    if (queue.length) localStorage.setItem(GOAL_EVENT_QUEUE_KEY, JSON.stringify(queue));
    else localStorage.removeItem(GOAL_EVENT_QUEUE_KEY);
  } catch {
    // Quota. The in-memory log still has the row; only replay-after-reload is lost.
  }
}

function queueGoalEvent(row) {
  const queue = readGoalEventQueue();
  if (!queue.some((event) => event.id === row.id)) {
    queue.push(row);
    writeGoalEventQueue(queue);
  }
  scheduleGoalQueueFlush();
}

function scheduleGoalQueueFlush() {
  clearTimeout(goalQueueFlushTimer);
  goalQueueFlushTimer = setTimeout(flushGoalEventQueue, 60_000);
}

async function flushGoalEventQueue() {
  const queue = readGoalEventQueue();
  if (!queue.length) return;
  try {
    const response = await fetch("/api/goal-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: queue })
    });
    if (!response.ok) throw new Error(`goal-log ${response.status}`);
    writeGoalEventQueue([]);
  } catch {
    scheduleGoalQueueFlush();
  }
}

function goalById(id) {
  return goalsDoc.goals.find((goal) => goal.id === id) || null;
}

// Context is date-scheduled rather than manually switched: a manual switch is
// itself a habit, and habits are the thing that fails. Goals outside the active
// context are dormant and must not accrue misses.
function activeContextOn(date) {
  let context = "";
  for (const row of goalsDoc.contextSchedule || []) {
    if (row && row.from && date >= row.from) context = row.context;
  }
  return context;
}

function goalAppliesOn(goal, date) {
  if (!goal || goal.archived) return false;
  if (goal.activeFrom && date < goal.activeFrom) return false;
  if (goal.activeTo && date > goal.activeTo) return false;
  const context = activeContextOn(date);
  if (!context || !Array.isArray(goal.contexts) || !goal.contexts.length) return true;
  return goal.contexts.includes(context);
}

function activeGoals(type, date) {
  return goalsDoc.goals
    .filter((goal) => (!type || goal.type === type) && goalAppliesOn(goal, date))
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
}

function goalTitleOn(goal, date) {
  const context = activeContextOn(date);
  return (goal.contextLabels && goal.contextLabels[context]) || goal.title;
}

function ruleForDate(date) {
  ensureRuleScheduleForMonth(date);
  return goalById((goalsDoc.ruleSchedule || {})[date] || "");
}

// Months are scheduled whole, on demand, and then frozen. Generating the month
// up front keeps the distribution fair by construction (every rule the same
// number of days, no rule twice running) instead of leaving it to chance, and
// persisting it means editing the rule list later cannot retroactively rewrite
// which rule a past day was actually shown.
function ensureRuleScheduleForMonth(date) {
  if (buildRuleScheduleForMonth(date)) persistGoalsDoc();
}

// Split from the persist so the boot pass can generate this month and the next
// one and write them in a single POST -- two fire-and-forget writes of the same
// document can land out of order, and the loser takes a month with it.
function buildRuleScheduleForMonth(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))) return false;
  const schedule = goalsDoc.ruleSchedule || (goalsDoc.ruleSchedule = {});
  if (schedule[date]) return false;
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(5, 7));
  const days = new Date(year, month, 0).getDate();
  const monthStart = `${date.slice(0, 7)}-01`;
  const monthEnd = `${date.slice(0, 7)}-${String(days).padStart(2, "0")}`;
  const rules = goalsDoc.goals.filter(
    (goal) =>
      goal.type === "rule" &&
      !goal.archived &&
      (!goal.activeFrom || goal.activeFrom <= monthEnd) &&
      (!goal.activeTo || goal.activeTo >= monthStart)
  );
  if (!rules.length) return false;

  const base = Math.floor(days / rules.length);
  const ranked = rules
    .map((goal, index) => ({ id: goal.id, weight: Number(goal.weight) || 1, index }))
    .sort((a, b) => b.weight - a.weight || a.index - b.index);
  const counts = new Map(ranked.map((rule) => [rule.id, base]));
  let remainder = days - base * rules.length;
  for (let i = 0; remainder > 0; i = (i + 1) % ranked.length, remainder -= 1) {
    counts.set(ranked[i].id, counts.get(ranked[i].id) + 1);
  }
  const pool = [];
  for (const [id, count] of counts) {
    for (let i = 0; i < count; i += 1) pool.push(id);
  }

  let seed = (year * 100 + month) >>> 0;
  const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  for (let pass = 0; pass < 40; pass += 1) {
    let clean = true;
    for (let i = 1; i < pool.length; i += 1) {
      if (pool[i] !== pool[i - 1]) continue;
      clean = false;
      const swap = pool.findIndex(
        (id, k) =>
          Math.abs(k - i) > 1 && id !== pool[i] && id !== pool[i - 1] && id !== pool[k - 1] && id !== pool[k + 1]
      );
      if (swap >= 0) [pool[i], pool[swap]] = [pool[swap], pool[i]];
    }
    if (clean) break;
  }

  let added = false;
  for (let day = 1; day <= days; day += 1) {
    const key = `${date.slice(0, 7)}-${String(day).padStart(2, "0")}`;
    if (schedule[key]) continue;
    schedule[key] = pool[day - 1];
    added = true;
  }
  return added;
}

// Generated on demand, the month you are standing in is always covered -- but
// only once you open a day inside it. Rolling the next month at boot means a
// session that goes offline over a month boundary still has a rule for every
// day, and the cached copy carries it.
function ensureRuleScheduleAhead(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))) return;
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(5, 7));
  const next = new Date(year, month, 1);
  const nextKey = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-01`;
  const built = [buildRuleScheduleForMonth(date), buildRuleScheduleForMonth(nextKey)];
  if (built.some(Boolean)) persistGoalsDoc();
}

// The month is fair by construction, but a rule that lands on a day it simply
// cannot be practised is a wasted day. A reroll rewrites this one day only —
// the rest of the month stays frozen, so the distribution barely moves and past
// days keep the rule they were actually shown.
function rerollRuleForDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))) return null;
  ensureRuleScheduleForMonth(date);
  const schedule = goalsDoc.ruleSchedule || (goalsDoc.ruleSchedule = {});
  const currentId = schedule[date] || "";
  const pool = activeGoals("rule", date).filter((rule) => rule.id !== currentId);
  if (!pool.length) return goalById(currentId);
  // The month was built so no rule runs two days straight; a reroll should not
  // undo that, but it also should not refuse to roll when it is the only move.
  const neighbours = new Set(
    [schedule[shiftISODate(date, -1)], schedule[shiftISODate(date, 1)]].filter(Boolean)
  );
  const spaced = pool.filter((rule) => !neighbours.has(rule.id));
  const choices = spaced.length ? spaced : pool;
  const picked = choices[Math.floor(Math.random() * choices.length)];
  schedule[date] = picked.id;
  persistGoalsDoc();
  return picked;
}

async function persistGoalsDoc() {
  // A doc restored from the cache is a snapshot of the last successful read.
  // Posting it back would drop every goal edited on disk since, so an offline
  // session keeps its schedule in memory and writes nothing.
  if (!goalsDocLoaded) return;
  try {
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(goalsDoc)
    });
    cacheGoalsDoc();
  } catch {
    // The in-memory schedule is deterministic, so an offline write only costs
    // the freeze — the same rule still resolves for the same day.
  }
}

function latestGoalEvent(goalId, date, kind) {
  let found = null;
  for (const event of goalLog) {
    if (event.goalId !== goalId || event.date !== date) continue;
    if (kind && event.kind !== kind) continue;
    if (!found || String(event.ts) >= String(found.ts)) found = event;
  }
  return found;
}

// Two-day grace, then friction. Older days are not blocked outright — the door
// stays open through a deliberate unlock — but they are never surfaced, counted
// as owed, or prompted for. A growing backlog is what kills the streak.
function withinBacklogGrace(date) {
  const grace = Number(goalsDoc.backlogGraceDays ?? 2);
  const today = todayISO();
  if (date > today) return false;
  const days = Math.round((new Date(`${today}T00:00`) - new Date(`${date}T00:00`)) / 86400000);
  return days <= grace;
}

function goalEditable(date) {
  return goalBacklogUnlocked || withinBacklogGrace(date);
}

// Append-only: an edit adds a newer event rather than mutating the old one, so
// undo and replay both stay honest.
async function logGoalEvent(event) {
  const row = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    ts: new Date().toISOString(),
    date: state.currentDate,
    source: "app",
    ...event
  };
  goalLog.push(row);
  try {
    await fetch("/api/goal-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: [row] })
    });
  } catch {
    // Network failure only — a 4xx answer means the server saw it and said no,
    // and replaying that forever would be a different bug. The queued row
    // survives a reload and replays when the server is reachable again.
    queueGoalEvent(row);
  }
  return row;
}

// Daily goals split three ways by `surface`:
//   task    — a real recurring task in the inbox, so it sits in the list being
//             worked from rather than in a separate habit widget
//   survey  — a checkbox in the night survey's daily block
//   derived — already measured by a question the survey has asked for months
function dailyGoalsWithSurface(surface, date) {
  return activeGoals("daily", date).filter((goal) => goal.surface === surface);
}

// A daily goal task is for its day and no other, so it expires at midnight
// unless the goal opts out with `expires: false`. The default is deliberate:
// the failure mode of forgetting the flag on a new goal is a task that
// disappears on time, not another one silently stacking up in the inbox.
function dailyGoalExpires(goal) {
  return Boolean(goal) && goal.type === "daily" && goal.surface === "task" && goal.expires !== false;
}

// The date a task stops being relevant, or "" if it carries forward. Tasks
// materialised before expiry existed have no `expiresOn`, so the goal
// definition backfills it — that is what clears the pile-up already on disk.
function taskExpiryDate(task, entryDate) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(task?.expiresOn || ""))) return task.expiresOn;
  if (!task?.goalId || !dailyGoalExpires(goalById(task.goalId))) return "";
  const sourceDate = String(task.sourceDate || "");
  return /^\d{4}-\d{2}-\d{2}$/.test(sourceDate) ? sourceDate : entryDate;
}

// One task per goal per day. The `materialize` event is the guard against
// creating duplicates on every reload; it is written before the async POST
// settles, so the check holds within a single pass too. Returns the dates it
// touched; saving and rendering belong to refreshDailyGoalTasks().
function ensureDailyGoalTasks(date = todayISO()) {
  if (date !== todayISO()) return [];
  ensureEntry(date);
  const entry = state.entries[date];
  if (!entry) return [];
  ensureTaskState(entry);
  let changed = false;
  for (const goal of dailyGoalsWithSurface("task", date)) {
    const text = goal.taskText || goal.title;
    const estimate = normalizeEstimateMinutes(goal.estimateMinutes);
    const category = normalizeCalendarCategory(goal.calendarCategory);
    if (latestGoalEvent(goal.id, date, "materialize")) {
      // Renaming a goal, or giving it an estimate, has to reach the row already
      // sitting in the list, or the change only appears tomorrow.
      for (const sectionKey of TASK_SECTION_KEYS) {
        for (const task of entry.tasks[sectionKey] || []) {
          if (task.goalId !== goal.id) continue;
          // The category only fills a blank, unlike the text and the estimate:
          // it is also settable on the row, and a goal that overwrote today's
          // choice on every render would make that control a lie. Backfilling
          // blanks is what reaches tasks materialised before the field existed.
          const fillCategory = category && !task.calendarCategory;
          if (task.text === text && task.estimateMinutes === estimate && !fillCategory) continue;
          task.text = text;
          task.estimateMinutes = estimate;
          if (fillCategory) task.calendarCategory = category;
          task.updatedAt = new Date().toISOString();
          changed = true;
        }
      }
      continue;
    }
    entry.tasks.inbox.push(
      normalizeTask(
        {
          text,
          goalId: goal.id,
          project: "goal",
          priority: "p3",
          sourceDate: date,
          expiresOn: dailyGoalExpires(goal) ? date : "",
          estimateMinutes: estimate,
          calendarCategory: category
        },
        "inbox"
      )
    );
    logGoalEvent({ goalId: goal.id, date, kind: "materialize", value: true });
    changed = true;
  }
  return changed ? [date] : [];
}

// Missed daily goals used to carry forward like any other inbox item, so by day
// five the list was five undated copies of the same four habits and the real
// todo list was buried. An expired task is discarded against the day it was
// for and booked as a miss, which is also what makes the monthly review honest:
// a habit nobody did on the 3rd should read as a miss on the 3rd, not as a task
// still theoretically open on the 12th.
function expireDailyGoalTasks(actualDate = todayISO()) {
  const touched = new Set();
  for (const [entryDate, entry] of Object.entries(state.entries || {})) {
    if (!entry?.tasks) continue;
    ensureTaskState(entry);
    for (const sectionKey of TASK_SECTION_KEYS) {
      const list = entry.tasks[sectionKey];
      if (!Array.isArray(list)) continue;
      for (let index = list.length - 1; index >= 0; index -= 1) {
        const task = list[index];
        const expiresOn = taskExpiryDate(task, entryDate);
        if (!expiresOn || expiresOn >= actualDate) continue;
        list.splice(index, 1);
        touched.add(entryDate);
        // A check already on the books means the day was answered somewhere
        // other than this row -- the survey checkbox, a blind-journaling break,
        // or the server settling the goal from the entry itself. Discarding the
        // task then would leave the task history saying "never did it" while the
        // goal log says the opposite, which is the disagreement that made the
        // adherence numbers unreadable. The row follows the evidence.
        const checked = task.goalId ? latestGoalEvent(task.goalId, expiresOn, "check") : null;
        if (checked && checked.value) {
          entry.tasks.completed.push({
            ...task,
            source: sectionKey,
            sourceDate: entryDate,
            previousIndex: index,
            expiresOn,
            completedAt: checked.ts || new Date().toISOString(),
            completedVia: task.completedVia || null
          });
          continue;
        }
        entry.tasks.discarded.push({
          ...task,
          source: sectionKey,
          sourceDate: entryDate,
          previousIndex: index,
          expiresOn,
          discardedAt: new Date().toISOString()
        });
        /* A date the clock jumped over was never a day you could have done
           anything on, and a date with four hours in it was not a fair one to
           ask. Both get the same treatment as a day the goal was never put up:
           the row goes, and no miss is written. Booking one would put a black
           mark on the adherence numbers for the crime of getting on a plane,
           and -- worse -- it would be indistinguishable from a real one later. */
        if (typeof isShortZoneDate === "function" && isShortZoneDate(expiresOn)) continue;
        // Only book the miss when nothing else answered the day: a second
        // materialised copy must not overwrite the first row's outcome.
        if (task.goalId && !latestGoalEvent(task.goalId, expiresOn, "miss")) {
          logGoalEvent({ goalId: task.goalId, date: expiresOn, kind: "miss", value: false, source: "task" });
        }
      }
    }
  }
  return [...touched];
}

// Runs on load and again whenever the poll notices the real date rolled over,
// so a browser left open overnight both books yesterday's misses and puts up
// today's tasks without a reload.
function refreshDailyGoalTasks(date = todayISO()) {
  const touched = new Set([...expireDailyGoalTasks(date), ...ensureDailyGoalTasks(date)]);
  if (!touched.size) return;
  saveEverywhere({ extraDates: [...touched] });
  renderTasksView();
  renderSidePanel();
  renderCompletedOutput();
}

function morningRulePlanText() {
  const entry = currentEntry();
  return entry.morning.survey?.ruleplan || "";
}

// The day's rule, plus any other rule already rated today (adding one from the
// menu writes a neutral rating, so the menu needs no separate UI state).
// Every month is generated whole the first time it is touched, so "there is no
// rule for today" is almost never the real answer. Naming the actual cause
// matters: one of these is fixed by starting the server, the others are not
// fixed by hand-entering a schedule.
function noRuleReason(date) {
  if (!goalsDocLoaded && !goalsDoc.goals.length) {
    return "Rules unavailable — the journal server could not be reached.";
  }
  if (!activeGoals("rule", date).length) return "No rules are active for this date.";
  return "No rule scheduled for this date.";
}

function ratedRulesForDate(date) {
  const rules = [];
  const dayRule = ruleForDate(date);
  if (dayRule) rules.push(dayRule);
  for (const goal of activeGoals("rule", date)) {
    if (rules.some((rule) => rule.id === goal.id)) continue;
    if (latestGoalEvent(goal.id, date, "rating")) rules.push(goal);
  }
  return rules;
}

function syncDailyCheckSummary(survey, date) {
  const parts = [];
  for (const goal of dailyGoalsWithSurface("survey", date)) {
    const event = latestGoalEvent(goal.id, date, "check");
    if (event && event.value) parts.push(goal.title);
  }
  survey.dailycheck = parts.join(", ");
}

// The two ongoing behaviours get checkboxes. The five task-backed goals are
// already answered by whether their task got completed, so they show as a
// read-only readout — asking again would be asking twice.
function appendDailyGoalsControl(fieldset, survey, question) {
  const date = state.currentDate;
  const checkable = dailyGoalsWithSurface("survey", date);
  const fromTasks = dailyGoalsWithSurface("task", date);
  if (!checkable.length && !fromTasks.length) {
    const note = document.createElement("div");
    note.className = "survey-note";
    note.textContent = "No daily goals active for this date.";
    fieldset.append(note);
    return;
  }

  const editable = goalEditable(date);
  if (checkable.length) {
    const list = document.createElement("div");
    list.className = "choice-grid";
    for (const goal of checkable) {
      const event = latestGoalEvent(goal.id, date, "check");
      const label = document.createElement("label");
      label.className = "choice-option";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = Boolean(event && event.value);
      input.disabled = !editable;
      input.addEventListener("change", () => {
        logGoalEvent({ goalId: goal.id, kind: "check", value: input.checked });
        syncDailyCheckSummary(survey, date);
        debouncedSave();
        renderOutputs();
      });
      label.append(input, document.createTextNode(goalTitleOn(goal, date)));
      list.append(label);
    }
    fieldset.append(list);
  }

  if (!fromTasks.length) return;
  const done = fromTasks.filter((goal) => {
    const event = latestGoalEvent(goal.id, date, "check");
    return Boolean(event && event.value);
  });
  const readout = document.createElement("div");
  readout.className = "survey-note daily-goal-readout";
  readout.textContent = `From your tasks: ${done.length} of ${fromTasks.length} done — ${
    fromTasks
      .map((goal) => {
        const event = latestGoalEvent(goal.id, date, "check");
        return `${event && event.value ? "✓" : "·"} ${goal.taskText || goal.title}`;
      })
      .join("   ")
  }`;
  fieldset.append(readout);
}

function syncRuleCheckSummary(survey, date) {
  const parts = [];
  for (const rule of ratedRulesForDate(date)) {
    const event = latestGoalEvent(rule.id, date, "rating");
    if (!event) continue;
    parts.push(`${rule.title}: ${event.value}${event.note ? ` — ${event.note}` : ""}`);
  }
  survey.rulecheck = parts.join(" | ");
}

// Rated on the same -5..+5 scale used in the monthly review, so the numbers
// carry straight across into the September grading without translation.
function appendRuleRatingsControl(fieldset, survey, question) {
  const date = state.currentDate;
  const rules = ratedRulesForDate(date);
  if (!rules.length) {
    const note = document.createElement("div");
    note.className = "survey-note";
    note.textContent = noRuleReason(date);
    fieldset.append(note);
    return;
  }

  const plan = morningRulePlanText();
  if (plan) {
    const note = document.createElement("div");
    note.className = "survey-note";
    note.textContent = `This morning you said: ${plan}`;
    fieldset.append(note);
  }

  const editable = goalEditable(date);
  const list = document.createElement("div");
  list.className = "rule-rating-list";

  for (const rule of rules) {
    const existing = latestGoalEvent(rule.id, date, "rating");
    const card = document.createElement("div");
    card.className = "rule-rating-row";

    const title = document.createElement("div");
    title.className = "rule-rating-title";
    title.textContent = rule.title;
    card.append(title);

    const sliderRow = document.createElement("label");
    sliderRow.className = "slider-row";
    const sliderLabel = document.createElement("span");
    sliderLabel.textContent = "How well did you do?";
    const output = document.createElement("output");
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "-5";
    slider.max = "5";
    slider.step = "1";
    slider.disabled = !editable;
    slider.value = String(existing ? existing.value : 0);
    output.textContent = slider.value;
    const noteInput = document.createElement("input");
    noteInput.type = "text";
    noteInput.className = "rule-rating-note";
    noteInput.placeholder = "What happened? (one line)";
    noteInput.disabled = !editable;
    noteInput.value = existing ? existing.note || "" : "";

    const commit = () => {
      logGoalEvent({
        goalId: rule.id,
        kind: "rating",
        value: Number(slider.value),
        note: noteInput.value.trim()
      });
      syncRuleCheckSummary(survey, date);
      debouncedSave();
      renderOutputs();
    };
    slider.addEventListener("input", () => {
      output.textContent = slider.value;
    });
    slider.addEventListener("change", commit);
    noteInput.addEventListener("change", commit);

    sliderRow.append(sliderLabel, slider, output);
    card.append(sliderRow, noteInput);
    list.append(card);
  }
  fieldset.append(list);

  const remaining = activeGoals("rule", date).filter((rule) => !rules.some((shown) => shown.id === rule.id));
  if (!remaining.length || !editable) return;
  const adder = document.createElement("div");
  adder.className = "rule-rating-add";
  const select = document.createElement("select");
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Another rule was relevant today…";
  select.append(placeholder);
  for (const rule of remaining) {
    const option = document.createElement("option");
    option.value = rule.id;
    option.textContent = rule.title;
    select.append(option);
  }
  select.addEventListener("change", async () => {
    if (!select.value) return;
    await logGoalEvent({ goalId: select.value, kind: "rating", value: 0, note: "" });
    renderSurveyForm();
  });
  adder.append(select);
  fieldset.append(adder);
}

// The night survey is where the day's captured rows get thought through. The
// rows stay out of the survey schema — they are freeform and repeating — so this
// is a prompt into the Mistakes view rather than a survey question.
function appendMistakeReviewPrompt() {
  if (state.session !== "night") return;
  const entry = currentEntry();
  ensureMistakeState(entry);
  if (!entry.mistakes.length) return;
  const unfinished = unfinishedMistakeCount(entry);
  const prompt = document.createElement("button");
  prompt.type = "button";
  prompt.className = unfinished ? "mistake-review-prompt is-unfinished" : "mistake-review-prompt";
  const total = entry.mistakes.length;
  prompt.textContent = unfinished
    ? `${total} ${total === 1 ? "lesson" : "lessons"} logged today — ${unfinished} still to fill in. Review the log →`
    : `${total} ${total === 1 ? "lesson" : "lessons"} logged today, all filled in. Review the log →`;
  prompt.addEventListener("click", () => setView("mistakes"));
  els.formView.append(prompt);
}

function renderSurveyForm() {
  const session = currentSession();
  els.formView.innerHTML = "";
  appendSurveyEditToggle();
  appendSurveyTransferPanel();
  appendSurveyDayCalendar();
  appendMistakeReviewPrompt();
  appendNightEvidencePanel();
  const questions = visibleSurveyQuestions(state.session);
  for (const [questionIndex, question] of questions.entries()) {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "survey-card";
    if (question.type === "descriptive") fieldset.classList.add("is-descriptive");
    const legend = document.createElement("legend");
    legend.textContent = surveyDisplayLabel(question);
    if (surveyEditMode) {
      const tools = document.createElement("span");
      tools.className = "question-tools";

      const up = document.createElement("button");
      up.type = "button";
      up.className = "question-move";
      up.textContent = "↑";
      up.title = "Move this question up";
      up.setAttribute("aria-label", `Move ${surveyDisplayLabel(question)} up`);
      up.disabled = questionIndex === 0;
      up.addEventListener("click", () => moveSurveyQuestion(question, -1));

      const down = document.createElement("button");
      down.type = "button";
      down.className = "question-move";
      down.textContent = "↓";
      down.title = "Move this question down";
      down.setAttribute("aria-label", `Move ${surveyDisplayLabel(question)} down`);
      down.disabled = questionIndex === questions.length - 1;
      down.addEventListener("click", () => moveSurveyQuestion(question, 1));
      tools.append(up, down);

      // Only questions written by hand can be edited. The shipped ones are
      // referred to by id all over the app -- sleep detection, the goal sweep,
      // the historical import -- so a renamed or retyped `sleep` would be a
      // rename in one place and a break in five.
      if (question.custom) {
        const edit = document.createElement("button");
        edit.type = "button";
        edit.className = "question-remove";
        edit.textContent = "Edit";
        edit.setAttribute("aria-label", `Edit question ${surveyDisplayLabel(question)}`);
        edit.addEventListener("click", () => openQuestionEditor(draftFromQuestion(question)));
        tools.append(edit);
      }

      const removeQuestion = document.createElement("button");
      removeQuestion.type = "button";
      removeQuestion.className = "question-remove";
      removeQuestion.title = `Remove this question from ${formatDateLine(state.currentDate)} onward`;
      removeQuestion.setAttribute("aria-label", `Remove question ${surveyDisplayLabel(question)}`);
      removeQuestion.textContent = "Remove question";
      removeQuestion.addEventListener("click", () => removeSurveyQuestion(question));
      tools.append(removeQuestion);
      legend.append(tools);
    }
    fieldset.append(legend);
    const intentionText = question.id === "intentioncheck" ? morningIntentionText() : "";
    if (intentionText) {
      const note = document.createElement("div");
      note.className = "survey-note";
      note.textContent = `Morning intention: ${intentionText}`;
      fieldset.append(note);
    }
    // The rule is the whole point of the morning question, so it leads rather
    // than sitting somewhere the eye has already learned to skip.
    if (question.id === "ruleplan") {
      const note = document.createElement("div");
      const title = document.createElement("span");
      title.className = "rule-of-day-title";
      const paint = (rule) => {
        note.className = rule ? "survey-note rule-of-day" : "survey-note";
        title.textContent = rule ? rule.title : noRuleReason(state.currentDate);
      };
      paint(ruleForDate(state.currentDate));
      note.append(title);
      // A rule you cannot practise today is a dead day, and the honest fix is a
      // different rule rather than a skipped morning. Only offered when there is
      // something else to roll into.
      if (activeGoals("rule", state.currentDate).length > 1) {
        const dice = document.createElement("button");
        dice.type = "button";
        dice.className = "rule-dice";
        dice.textContent = "🎲";
        dice.title = "Swap today's rule for a different one at random";
        dice.setAttribute("aria-label", "Pick a different rule of the day at random");
        dice.addEventListener("click", () => {
          paint(rerollRuleForDate(state.currentDate));
          dice.classList.remove("rolling");
          void dice.offsetWidth;
          dice.classList.add("rolling");
        });
        note.append(dice);
      }
      fieldset.append(note);
    }
    appendSurveyControl(fieldset, question, session);
    els.formView.append(fieldset);
  }
  appendQuestionEditor();
  appendRemovedQuestionsPanel();
}

function appendSurveyEditToggle() {
  const bar = document.createElement("div");
  bar.className = "survey-edit-bar";
  const button = document.createElement("button");
  button.type = "button";
  button.className = surveyEditMode ? "survey-edit-toggle active" : "survey-edit-toggle";
  button.textContent = surveyEditMode ? "Done editing" : "Edit survey";
  button.setAttribute("aria-pressed", String(surveyEditMode));
  button.addEventListener("click", () => {
    surveyEditMode = !surveyEditMode;
    if (!surveyEditMode) surveyQuestionDraft = null;
    renderSurveyForm();
  });
  bar.append(button);
  if (surveyEditMode) {
    const add = document.createElement("button");
    add.type = "button";
    add.className = surveyQuestionDraft ? "survey-edit-toggle active" : "survey-edit-toggle";
    add.textContent = "Add a question";
    add.setAttribute("aria-pressed", String(Boolean(surveyQuestionDraft)));
    add.addEventListener("click", () => {
      if (surveyQuestionDraft) closeQuestionEditor();
      else openQuestionEditor(blankQuestionDraft());
    });
    bar.append(add);
  }
  const transfer = document.createElement("button");
  transfer.type = "button";
  transfer.className = surveyTransferOpen ? "survey-edit-toggle active" : "survey-edit-toggle";
  transfer.textContent = surveyTransferOpen ? "Close move/copy" : "Move or copy day…";
  transfer.title = `Move or copy this ${state.session} survey between days`;
  transfer.setAttribute("aria-pressed", String(surveyTransferOpen));
  transfer.addEventListener("click", () => {
    surveyTransferOpen = !surveyTransferOpen;
    renderSurveyForm();
  });
  bar.append(transfer);
  if (surveyEditMode) {
    const note = document.createElement("span");
    note.className = "survey-edit-note";
    note.textContent = `Adds and removals apply from ${formatDateLine(state.currentDate)} onward. Earlier days keep the survey they had.`;
    bar.append(note);
  }
  els.formView.append(bar);
}

/* --- Moving a survey onto the day it belongs to -----------------------------

   A survey filled in against the wrong date is a routine mistake and, until
   now, an expensive one: the only repair was to read every answer off one day
   and retype it into another, which in practice meant the wrong day kept the
   answers. Two questions decide what a transfer does -- which way (send this
   day's survey elsewhere, or pull another day's here) and whether the source
   keeps a copy.

   The transfer is wholesale, not a merge. Half of Tuesday's answers over half
   of Wednesday's describes a day that never happened, and no warning on the
   button would make that recoverable by eye afterwards.

   Two keys never travel. `rulecheck` and `dailycheck` are write-only mirrors of
   goal-log rows for their own date (see LLM_README, "Goal state never touches
   entries"), rebuilt on every render of the day that owns them; carrying them
   would file one day's habits under another's. The `_`-prefixed calendar
   autofill markers *do* travel, because they belong to the answers next to
   them: without them the sleep and nap prefills would treat a moved answer as
   an untouched field and quietly refill it from the wrong day's calendar.
--------------------------------------------------------------------------- */

const SURVEY_TRANSFER_SKIP_KEYS = new Set(["rulecheck", "dailycheck"]);

function transferableSurveyKeys(survey) {
  return Object.keys(survey || {}).filter((key) => !SURVEY_TRANSFER_SKIP_KEYS.has(key));
}

// Mirror of surveyValueAnswered() in server.cjs, and it has to stay one: this
// is what decides whether a day is described as having a survey to move, and
// the server uses the same rule to decide whether the goal log counts it as
// filled in. An untouched slider block still carries every label
// ("How much joy?: ; Did I get done what I needed to today?: "), so a non-empty string is not an answer
// until one label has something after its colon.
function surveyAnswerIsReal(value) {
  if (value && typeof value === "object") {
    return Boolean(String(value.text || "").trim() || value.image || (Array.isArray(value.files) && value.files.length));
  }
  const text = String(value ?? "").trim();
  if (!text) return false;
  if (!text.includes(":")) return true;
  return text.split(";").some((part) => {
    const colon = part.indexOf(":");
    return colon === -1 ? Boolean(part.trim()) : Boolean(part.slice(colon + 1).trim());
  });
}

function surveyAnswerCount(survey) {
  return Object.entries(survey || {}).filter(
    ([key, value]) => !key.startsWith("_") && !SURVEY_TRANSFER_SKIP_KEYS.has(key) && surveyAnswerIsReal(value)
  ).length;
}

function sessionSurveyAnswerCount(dateString, sessionName) {
  const entry = state.entries[dateString];
  return surveyAnswerCount(entry?.[sessionName]?.survey);
}

// Answers whose question was removed before the target date still save, they
// just have nothing to render into. Worth saying out loud rather than letting
// a moved answer vanish from view and read as lost.
function surveyAnswersHiddenOn(survey, sessionName, dateString) {
  const answered = new Set(
    Object.keys(survey || {}).filter((key) => !key.startsWith("_") && surveyAnswerIsReal(survey[key]))
  );
  return SCHEMA.surveys[sessionName]
    .filter((question) => answered.has(question.id))
    .filter((question) => !isQuestionVisibleOn(sessionName, question.id, dateString))
    .map((question) => surveyDisplayLabel(question));
}

function transferSurvey(fromDate, toDate, sessionName, mode) {
  ensureEntry(fromDate);
  ensureEntry(toDate);
  const source = state.entries[fromDate][sessionName];
  const target = state.entries[toDate][sessionName];
  const carried = {};
  for (const key of transferableSurveyKeys(source.survey)) carried[key] = cloneValue(source.survey[key]);
  const record = {
    fromDate,
    toDate,
    sessionName,
    mode,
    carried,
    replacedSurvey: {},
    replacedChecked: cloneValue(target.checked || {}),
    sourceChecked: cloneValue(source.checked || {})
  };
  for (const key of transferableSurveyKeys(target.survey)) {
    record.replacedSurvey[key] = cloneValue(target.survey[key]);
    delete target.survey[key];
  }
  Object.assign(target.survey, cloneValue(carried));
  target.checked = cloneValue(source.checked || {});
  if (mode === "move") {
    for (const key of transferableSurveyKeys(source.survey)) delete source.survey[key];
    source.checked = {};
  }
  record.resultFingerprint = surveyTransferFingerprint(toDate, sessionName);
  return record;
}

// What the undo button is offering to put back. Once the target day has been
// edited by hand the offer is a lie -- undo would throw that editing away to
// restore a state nobody is looking at any more -- so the button goes.
//
// Only the target is watched. A move leaves the source blank, and a blank
// morning survey is refilled from the day's own calendar by the sleep and nap
// prefills on the very next render, so a source fingerprint would go stale by
// itself within a frame of the move that created it.
function surveyTransferFingerprint(dateString, sessionName) {
  const session = state.entries[dateString]?.[sessionName];
  const survey = {};
  for (const key of transferableSurveyKeys(session?.survey)) survey[key] = session.survey[key];
  return stableStringify([survey, session?.checked || {}]);
}

function undoSurveyTransfer(record) {
  if (!record) return;
  ensureEntry(record.fromDate);
  ensureEntry(record.toDate);
  const source = state.entries[record.fromDate][record.sessionName];
  const target = state.entries[record.toDate][record.sessionName];
  for (const key of transferableSurveyKeys(target.survey)) delete target.survey[key];
  Object.assign(target.survey, cloneValue(record.replacedSurvey));
  target.checked = cloneValue(record.replacedChecked);
  if (record.mode === "move") {
    for (const key of transferableSurveyKeys(source.survey)) delete source.survey[key];
    Object.assign(source.survey, cloneValue(record.carried));
    source.checked = cloneValue(record.sourceChecked);
  }
  lastSurveyTransfer = null;
  logAppEvent("survey-transfer-undo", { from: record.fromDate, to: record.toDate, session: record.sessionName, mode: record.mode });
  saveEverywhere({ extraDates: [record.fromDate, record.toDate] });
  renderSurveyForm();
  renderOutputs();
  els.saveStatus.textContent = `Put the ${record.sessionName} survey back on ${formatShortDate(record.fromDate)}`;
}

function runSurveyTransfer(mode) {
  const sessionName = state.session;
  const here = state.currentDate;
  const other = surveyTransferTargetDate();
  if (!other || other === here) return;
  const fromDate = surveyTransferDirection === "to" ? here : other;
  const toDate = surveyTransferDirection === "to" ? other : here;
  if (!sessionSurveyAnswerCount(fromDate, sessionName)) return;
  const replacing = sessionSurveyAnswerCount(toDate, sessionName);
  if (replacing) {
    const verb = mode === "move" ? "Move" : "Copy";
    const confirmed = confirm(
      `${verb} the ${sessionName} survey from ${formatShortDate(fromDate)} onto ${formatShortDate(toDate)}?\n\n` +
        `${formatShortDate(toDate)} already has ${replacing} answer${replacing === 1 ? "" : "s"}. They are replaced, not merged.`
    );
    if (!confirmed) return;
  }
  lastSurveyTransfer = transferSurvey(fromDate, toDate, sessionName, mode);
  logAppEvent("survey-transfer", { from: fromDate, to: toDate, session: sessionName, mode });
  saveEverywhere({ extraDates: [fromDate, toDate] });
  renderSurveyForm();
  renderOutputs();
  els.saveStatus.textContent = `${mode === "move" ? "Moved" : "Copied"} the ${sessionName} survey to ${formatShortDate(toDate)}`;
}

function surveyTransferTargetDate() {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(surveyTransferDate)) return "";
  return surveyTransferDate;
}

function appendSurveyTransferPanel() {
  if (!surveyTransferOpen) return;
  // Yesterday is the overwhelmingly common answer: the survey that went onto
  // the wrong day is normally one day out.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(surveyTransferDate)) surveyTransferDate = shiftISODate(state.currentDate, -1);

  const sessionName = state.session;
  const panel = document.createElement("section");
  panel.className = "survey-transfer";

  const head = document.createElement("div");
  head.className = "survey-transfer-head";
  const title = document.createElement("strong");
  title.textContent = `Move or copy the ${sessionName} survey`;
  head.append(title);
  panel.append(head);

  const controls = document.createElement("div");
  controls.className = "survey-transfer-controls";

  const directions = document.createElement("div");
  directions.className = "segmented-control survey-transfer-directions";
  for (const [value, label] of [["to", "Send this day’s →"], ["from", "← Bring one here"]]) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.className = surveyTransferDirection === value ? "active" : "";
    button.addEventListener("click", () => {
      surveyTransferDirection = value;
      renderSurveyForm();
    });
    directions.append(button);
  }
  controls.append(directions);

  const dateLabel = document.createElement("label");
  dateLabel.className = "survey-transfer-date";
  const dateText = document.createElement("span");
  dateText.textContent = surveyTransferDirection === "to" ? "Onto" : "From";
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.value = surveyTransferDate;
  dateInput.addEventListener("change", () => {
    surveyTransferDate = dateInput.value;
    renderSurveyForm();
  });
  dateLabel.append(dateText, dateInput);
  controls.append(dateLabel);
  panel.append(controls);

  const here = state.currentDate;
  const other = surveyTransferTargetDate();
  const fromDate = surveyTransferDirection === "to" ? here : other;
  const toDate = surveyTransferDirection === "to" ? other : here;
  const sourceCount = other && fromDate ? sessionSurveyAnswerCount(fromDate, sessionName) : 0;
  const targetCount = other && toDate ? sessionSurveyAnswerCount(toDate, sessionName) : 0;

  const summary = document.createElement("p");
  summary.className = "survey-transfer-summary";
  if (!other) summary.textContent = "Pick a date.";
  else if (other === here) summary.textContent = "That is the day you are already on.";
  else if (!sourceCount) summary.textContent = `${formatShortDate(fromDate)} has no ${sessionName} survey answers to move.`;
  else {
    summary.textContent =
      `${sourceCount} answer${sourceCount === 1 ? "" : "s"} from ${formatShortDate(fromDate)} → ${formatShortDate(toDate)}.`;
  }
  panel.append(summary);

  const ready = Boolean(other) && other !== here && sourceCount > 0;
  if (ready && targetCount) {
    const warning = document.createElement("p");
    warning.className = "survey-transfer-warning";
    warning.textContent =
      `${formatShortDate(toDate)} already has ${targetCount} answer${targetCount === 1 ? "" : "s"}. They are replaced, not merged.`;
    panel.append(warning);
  }
  if (ready) {
    const hidden = surveyAnswersHiddenOn(state.entries[fromDate][sessionName].survey, sessionName, toDate);
    if (hidden.length) {
      const note = document.createElement("p");
      note.className = "survey-transfer-warning";
      note.textContent =
        `${hidden.length} answer${hidden.length === 1 ? "" : "s"} belong to questions the survey did not have on ${formatShortDate(toDate)} (${hidden.join("; ")}). They are kept in the file but will not show on that day.`;
      panel.append(note);
    }
  }

  const actions = document.createElement("div");
  actions.className = "survey-transfer-actions";
  for (const [mode, label, hint] of [
    ["move", "Move", `Clears the ${sessionName} survey on the day it came from`],
    ["copy", "Copy", "Leaves the day it came from untouched"]
  ]) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = mode === "move" ? "" : "quiet";
    button.textContent = label;
    button.title = hint;
    button.disabled = !ready;
    button.addEventListener("click", () => runSurveyTransfer(mode));
    actions.append(button);
  }
  const record = lastSurveyTransfer;
  if (record && surveyTransferFingerprint(record.toDate, record.sessionName) === record.resultFingerprint) {
    const undo = document.createElement("button");
    undo.type = "button";
    undo.className = "quiet survey-transfer-undo";
    undo.textContent = `Undo ${record.mode} to ${formatShortDate(record.toDate)}`;
    undo.addEventListener("click", () => undoSurveyTransfer(record));
    actions.append(undo);
    if (record.toDate !== state.currentDate) {
      const go = document.createElement("button");
      go.type = "button";
      go.className = "quiet";
      go.textContent = `Go to ${formatShortDate(record.toDate)}`;
      go.addEventListener("click", () => {
        syncDocumentText();
        state.currentDate = record.toDate;
        ensureEntry(state.currentDate);
        saveLocal();
        render();
      });
      actions.append(go);
    }
  }
  panel.append(actions);
  els.formView.append(panel);
}

/* --- The day's calendar, beside the questions -------------------------------

   Both surveys ask what the day was like, and most of the answer is already on
   the calendar. Leaving the form to go and look is what gets a half-filled
   survey abandoned, so the real calendar view -- editable, with its own
   Plan/Both/Actual control -- is shown as a column to the right of the form
   (see renderWorkArea). All the form itself carries is the bar that opens and
   closes that column.
--------------------------------------------------------------------------- */

function appendSurveyDayCalendar() {
  const date = state.currentDate;

  const panel = document.createElement("section");
  panel.className = "survey-day-calendar";

  const head = document.createElement("div");
  head.className = "survey-day-calendar-head";

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "survey-day-calendar-toggle";
  toggle.setAttribute("aria-expanded", String(surveyCalendarOpen));
  toggle.textContent = surveyCalendarOpen ? "Hide the day's calendar →" : "Show the day's calendar →";
  toggle.title = surveyCalendarOpen ? "Close the calendar column" : "Open the day's calendar beside the survey";
  toggle.addEventListener("click", () => {
    surveyCalendarOpen = !surveyCalendarOpen;
    saveLocal();
    renderWorkArea();
  });
  head.append(toggle);

  const summary = document.createElement("span");
  summary.className = "survey-day-calendar-summary";
  summary.textContent = surveyDayCalendarSummary(date, eventsForDay(date));
  head.append(summary);

  panel.append(head);
  els.formView.append(panel);
}

function surveyDayCalendarSummary(date, events) {
  if (!events.length) return "nothing on the calendar";
  const dayStart = calendarDateToDayIndex(date) * 1440;
  const logged = coveredMinutesWithin(coverageSpans([date], "actual"), dayStart, dayStart + 1440);
  const parts = [`${events.length} event${events.length === 1 ? "" : "s"}`];
  if (logged) parts.push(`${(logged / 60).toFixed(1)}h logged`);
  return parts.join(" · ");
}

function appendRemovedQuestionsPanel() {
  if (!surveyEditMode) return;
  const removed = removedSurveyQuestions(state.session);
  if (!removed.length) return;
  const panel = document.createElement("details");
  panel.className = "removed-questions";
  const summary = document.createElement("summary");
  summary.textContent = `${removed.length} removed question${removed.length === 1 ? "" : "s"}`;
  panel.append(summary);
  for (const question of removed) {
    const row = document.createElement("div");
    row.className = "removed-question-row";
    const label = document.createElement("span");
    label.textContent = surveyDisplayLabel(question);
    const restore = document.createElement("button");
    restore.type = "button";
    restore.className = "quiet";
    restore.textContent = "Bring back";
    restore.addEventListener("click", () => restoreSurveyQuestion(question));
    row.append(label, restore);
    panel.append(row);
  }
  els.formView.append(panel);
}

function surveyDisplayLabel(question) {
  if (question.id === "naps") return "Did you take any naps today?";
  return question.label;
}

function appendSurveyControl(fieldset, question, session) {
  const survey = session.survey;
  if (question.type === "textImage") {
    appendTextImageControl(fieldset, survey, question);
    return;
  }

  if (question.type === "ruleRatings") {
    appendRuleRatingsControl(fieldset, survey, question);
    return;
  }

  if (question.type === "dailyGoals") {
    appendDailyGoalsControl(fieldset, survey, question);
    return;
  }

  // Types added after the original six. Kept in a table rather than another
  // dozen if-blocks: the add-question picker and Settings already read the type
  // registry, and a renderer missing from here is the one thing that would let
  // a question be created that cannot be answered.
  const renderer = SURVEY_CONTROL_RENDERERS[question.type];
  if (renderer) {
    renderer(fieldset, survey, question, session);
    return;
  }

  if (question.id === "interaction" && question.type === "multi") {
    appendInteractionControl(fieldset, question, session);
    return;
  }

  if (question.type === "multi" || question.type === "single") {
    const selected = splitAnswer(survey[question.id]);
    const list = document.createElement("div");
    list.className = "choice-grid";
    for (const choice of questionChoices(question, state.session)) {
      const display = choiceDisplay(choice);
      const label = document.createElement("label");
      label.className = "choice-option";
      const input = document.createElement("input");
      input.type = question.type === "multi" ? "checkbox" : "radio";
      input.name = `survey-${question.id}`;
      input.value = display;
      input.checked = selected.includes(display);
      input.addEventListener("change", () => {
        if (question.type === "multi") {
          const values = Array.from(list.querySelectorAll("input:checked")).map((item) => item.value);
          survey[question.id] = values.join(", ");
        } else {
          survey[question.id] = input.value;
        }
        debouncedSave();
        renderOutputs();
      });
      label.append(input, document.createTextNode(display));
      if (surveyEditMode) {
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "choice-remove";
        remove.title = `Remove "${display}" from ${formatDateLine(state.currentDate)} onward`;
        remove.setAttribute("aria-label", `Remove option ${display}`);
        remove.textContent = "×";
        remove.addEventListener("click", (event) => {
          event.preventDefault();
          removeSurveyChoice(question, display);
        });
        label.append(remove);
      }
      list.append(label);
    }
    fieldset.append(list);
    appendAddChoiceControl(fieldset, question, session);
    return;
  }

  if (question.type === "form") {
    if (question.id === "sleep" && state.session === "morning") appendSleepDetectionNote(fieldset, survey);
    const grid = document.createElement("div");
    grid.className = "field-grid";
    for (const field of question.fields || []) {
      if (isClockTimeField(field)) {
        grid.append(labeledTimeControl(field, fieldAnswer(survey[question.id], field), (value) => {
          survey[question.id] = setFieldAnswer(survey[question.id], field, value);
        }));
      } else {
        grid.append(labeledTextControl(field, fieldAnswer(survey[question.id], field), (value) => {
          survey[question.id] = setFieldAnswer(survey[question.id], field, value);
        }));
      }
    }
    fieldset.append(grid);
    return;
  }

  if (question.type === "slider") {
    const grid = document.createElement("div");
    grid.className = "slider-grid";
    // The shipped sliders keep their hard-coded scales; a slider written by
    // hand carries its own in config.
    const config = questionConfig(question);
    const min = Number.isFinite(Number(config.min)) && config.min !== "" ? Number(config.min) : question.id === "mental" ? 1 : 0;
    const max = Number.isFinite(Number(config.max)) && config.max !== "" ? Number(config.max) : 5;
    for (const field of question.fields || []) {
      const row = document.createElement("label");
      row.className = "slider-row";
      const text = document.createElement("span");
      text.textContent = field;
      const output = document.createElement("output");
      const input = document.createElement("input");
      input.type = "range";
      input.min = String(min);
      input.max = String(max);
      input.step = "1";
      input.value = fieldAnswer(survey[question.id], field) || String(min);
      output.textContent = input.value;
      input.addEventListener("input", () => {
        output.textContent = input.value;
        survey[question.id] = setFieldAnswer(survey[question.id], field, input.value);
        debouncedSave();
        scheduleOutputs();
      });
      row.append(text, input, output);
      grid.append(row);
    }
    fieldset.append(grid);
    return;
  }

  if (question.id === "naps") {
    appendNapControl(fieldset, survey);
    return;
  }

  if (question.id === "weight") {
    appendWeightControl(fieldset, survey);
    return;
  }

  const value = surveyValue(question, survey, state.currentDate);
  const control = question.type === "number"
    ? labeledInputControl(question.label, value, "number", (next) => {
        survey[question.id] = next;
      })
    : labeledTextareaControl(question.label, value, (next) => {
        survey[question.id] = next;
      });
  control.classList.add("single-answer");
  fieldset.append(control);
}

/* --- Controls for the added question types ----------------------------------

   Everything here writes back into the same `survey[question.id]` slot the
   original six use, in one of the shapes documented on QUESTION_TYPES.stores.
   That is the whole trick: the exporter, the goal-evidence sweep and the
   markdown build were never taught about these types and do not need to be.

   One rule the controls share: a control that can be held down -- a slider, a
   number field, a highlighted word -- saves through `debouncedSave()` and
   repaints through `scheduleOutputs()`, never a full `renderSurveyForm()`.
   Rebuilding the form under a pointer that is still down is what makes a
   control feel broken. Controls whose every change is a discrete click (rank
   order, NPS, the picture types) do re-render, because the answer changes shape
   and there is no pointer to interrupt.

   Choice lookups go through `questionChoices(question, state.session)`, so like
   the `multi` control they read the survey currently on screen rather than the
   session passed in. Fine while the form is the only caller; it is the thing to
   change first if these are ever drawn from the review screen.
--------------------------------------------------------------------------- */

function questionConfig(question) {
  return question.config && typeof question.config === "object" ? question.config : {};
}

function questionRows(question) {
  return (question.fields || questionConfig(question).fields || []).filter(Boolean);
}

// Choice-typed questions keep using the effective-dated choice list, so options
// added or retired mid-history behave the same as they do on a `multi`.
function questionOptions(question, sessionName) {
  return questionChoices(question, sessionName).map((choice) => choiceDisplay(choice)).filter(Boolean);
}

function surveyFieldsetNote(fieldset, text) {
  if (!text) return;
  const note = document.createElement("p");
  note.className = "survey-type-note";
  note.textContent = text;
  fieldset.append(note);
}

/* Matrix: one row per field, one column per choice, a radio in every cell.
   Stored exactly like `form` and `slider` ("Row: Column"), so a matrix can be
   swapped to a slider block later without the old answers becoming unreadable. */
function appendMatrixControl(fieldset, survey, question, session) {
  const rows = questionRows(question);
  const columns = questionOptions(question, state.session);
  if (!rows.length || !columns.length) {
    surveyFieldsetNote(fieldset, "This matrix needs at least one row and one column. Add them in Edit survey.");
    return;
  }
  const scroller = document.createElement("div");
  scroller.className = "matrix-scroll";
  const table = document.createElement("table");
  table.className = "matrix-table";
  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  headRow.append(document.createElement("th"));
  for (const column of columns) {
    const cell = document.createElement("th");
    cell.scope = "col";
    cell.textContent = column;
    headRow.append(cell);
  }
  head.append(headRow);
  table.append(head);

  const body = document.createElement("tbody");
  for (const row of rows) {
    const tr = document.createElement("tr");
    const label = document.createElement("th");
    label.scope = "row";
    label.textContent = row;
    tr.append(label);
    const current = fieldAnswer(survey[question.id], row);
    for (const column of columns) {
      const cell = document.createElement("td");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `matrix-${question.id}-${row}`;
      input.value = column;
      input.checked = normalize(current) === normalize(column);
      input.setAttribute("aria-label", `${row}: ${column}`);
      input.addEventListener("change", () => {
        survey[question.id] = setFieldAnswer(survey[question.id], row, column);
        debouncedSave();
        scheduleOutputs();
      });
      cell.append(input);
      tr.append(cell);
    }
    body.append(tr);
  }
  table.append(body);
  scroller.append(table);
  fieldset.append(scroller);
}

/* Rank order: up/down buttons rather than HTML5 drag. The phone is a first-class
   surface for this app (see the touch model in LLM_README) and native drag does
   not exist there, so a control that only worked with a mouse would be a
   question that cannot be answered in bed. */
function appendRankOrderControl(fieldset, survey, question) {
  const options = questionOptions(question, state.session);
  if (!options.length) {
    surveyFieldsetNote(fieldset, "This ranking has no options yet. Add them in Edit survey.");
    return;
  }
  const ranked = [...options].sort((a, b) => {
    const rankA = Number(fieldAnswer(survey[question.id], a)) || Number.POSITIVE_INFINITY;
    const rankB = Number(fieldAnswer(survey[question.id], b)) || Number.POSITIVE_INFINITY;
    if (rankA !== rankB) return rankA - rankB;
    return options.indexOf(a) - options.indexOf(b);
  });

  const commit = (order) => {
    let answer = "";
    order.forEach((option, index) => {
      answer = setFieldAnswer(answer, option, String(index + 1));
    });
    survey[question.id] = answer;
    debouncedSave();
    renderSurveyForm();
    renderOutputs();
  };

  const list = document.createElement("ol");
  list.className = "rank-order-list";
  ranked.forEach((option, index) => {
    const row = document.createElement("li");
    row.className = "rank-order-row";
    const text = document.createElement("span");
    text.textContent = option;
    const controls = document.createElement("div");
    controls.className = "rank-order-controls";
    const up = document.createElement("button");
    up.type = "button";
    up.className = "quiet";
    up.textContent = "↑";
    up.setAttribute("aria-label", `Move ${option} up`);
    up.disabled = index === 0;
    up.addEventListener("click", () => {
      const next = [...ranked];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      commit(next);
    });
    const down = document.createElement("button");
    down.type = "button";
    down.className = "quiet";
    down.textContent = "↓";
    down.setAttribute("aria-label", `Move ${option} down`);
    down.disabled = index === ranked.length - 1;
    down.addEventListener("click", () => {
      const next = [...ranked];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      commit(next);
    });
    controls.append(up, down);
    row.append(text, controls);
    list.append(row);
  });
  fieldset.append(list);

  const unranked = !String(survey[question.id] || "").trim();
  surveyFieldsetNote(
    fieldset,
    unranked ? "Nothing ranked yet — moving anything saves the whole order as it stands." : ""
  );
}

/* Constant sum: the running total is the point, so it is shown and coloured
   rather than silently validated on save. Nothing blocks an answer that does
   not add up; a survey that refuses to be filled in is worse than a wrong sum. */
function appendConstantSumControl(fieldset, survey, question) {
  const options = questionOptions(question, state.session);
  const total = Number(questionConfig(question).total) || 100;
  if (!options.length) {
    surveyFieldsetNote(fieldset, "This question has no options to divide the total across. Add them in Edit survey.");
    return;
  }
  const grid = document.createElement("div");
  grid.className = "field-grid constant-sum-grid";
  const tally = document.createElement("p");
  tally.className = "constant-sum-tally";

  const paintTally = () => {
    const sum = options.reduce((carry, option) => carry + (Number(fieldAnswer(survey[question.id], option)) || 0), 0);
    const rounded = Math.round(sum * 100) / 100;
    tally.textContent = `${rounded} of ${total}`;
    tally.classList.toggle("is-over", rounded > total);
    tally.classList.toggle("is-exact", rounded === total);
  };

  for (const option of options) {
    const label = document.createElement("label");
    label.className = "field-control";
    const caption = document.createElement("span");
    caption.textContent = option;
    const input = document.createElement("input");
    input.type = "number";
    input.step = "any";
    input.value = fieldAnswer(survey[question.id], option);
    input.addEventListener("input", () => {
      survey[question.id] = setFieldAnswer(survey[question.id], option, input.value);
      paintTally();
      debouncedSave();
      scheduleOutputs();
    });
    label.append(caption, input);
    grid.append(label);
  }
  fieldset.append(grid, tally);
  paintTally();
}

const NPS_ANCHORS = { low: "Not at all likely", high: "Extremely likely" };

function appendNpsControl(fieldset, survey, question) {
  const config = questionConfig(question);
  const current = String(survey[question.id] ?? "").trim();
  const scale = document.createElement("div");
  scale.className = "nps-scale";
  for (let score = 0; score <= 10; score += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "nps-button";
    if (score <= 6) button.classList.add("is-detractor");
    else if (score <= 8) button.classList.add("is-passive");
    else button.classList.add("is-promoter");
    button.classList.toggle("is-selected", current === String(score));
    button.textContent = String(score);
    button.setAttribute("aria-pressed", String(current === String(score)));
    button.addEventListener("click", () => {
      survey[question.id] = current === String(score) ? "" : String(score);
      debouncedSave();
      renderSurveyForm();
      renderOutputs();
    });
    scale.append(button);
  }
  const anchors = document.createElement("div");
  anchors.className = "nps-anchors";
  const low = document.createElement("span");
  low.textContent = config.lowLabel || NPS_ANCHORS.low;
  const high = document.createElement("span");
  high.textContent = config.highLabel || NPS_ANCHORS.high;
  anchors.append(low, high);
  fieldset.append(scale, anchors);
}

/* --- Tree-shaped options ----------------------------------------------------

   `drillDown` and `tree` share one config: an indented plain-text outline typed
   in the question editor, parsed into nodes. Indentation was chosen over a
   nested editor UI because the thing being described is a list, and a list is
   what people can already type.
--------------------------------------------------------------------------- */

function parseOutline(text) {
  const roots = [];
  const stack = [];
  for (const rawLine of String(text || "").split("\n")) {
    if (!rawLine.trim()) continue;
    const indent = (rawLine.match(/^[\t ]*/)?.[0] || "").replace(/\t/g, "  ").length;
    const node = { label: rawLine.trim(), depth: Math.floor(indent / 2), children: [] };
    while (stack.length && stack[stack.length - 1].depth >= node.depth) stack.pop();
    if (stack.length) stack[stack.length - 1].children.push(node);
    else roots.push(node);
    stack.push(node);
  }
  return roots;
}

function outlineFromQuestion(question) {
  return parseOutline(questionConfig(question).tree || "");
}

function appendDrillDownControl(fieldset, survey, question) {
  const roots = outlineFromQuestion(question);
  if (!roots.length) {
    surveyFieldsetNote(fieldset, "This drill-down has no list yet. Add one in Edit survey.");
    return;
  }
  const selected = String(survey[question.id] || "").split(">").map((part) => part.trim()).filter(Boolean);
  const row = document.createElement("div");
  row.className = "drill-down-row";

  let level = roots;
  let depth = 0;
  while (level.length) {
    const chosen = selected[depth] || "";
    const select = document.createElement("select");
    select.className = "drill-down-select";
    const blank = document.createElement("option");
    blank.value = "";
    blank.textContent = depth === 0 ? "Choose…" : "—";
    select.append(blank);
    for (const node of level) {
      const option = document.createElement("option");
      option.value = node.label;
      option.textContent = node.label;
      select.append(option);
    }
    select.value = level.some((node) => node.label === chosen) ? chosen : "";
    const atDepth = depth;
    select.addEventListener("change", () => {
      const next = selected.slice(0, atDepth);
      if (select.value) next.push(select.value);
      survey[question.id] = next.join(" > ");
      debouncedSave();
      renderSurveyForm();
      renderOutputs();
    });
    row.append(select);
    const match = level.find((node) => node.label === select.value);
    if (!match || !match.children.length) break;
    level = match.children;
    depth += 1;
  }
  fieldset.append(row);
}

function appendTreeControl(fieldset, survey, question) {
  const roots = outlineFromQuestion(question);
  if (!roots.length) {
    surveyFieldsetNote(fieldset, "This tree has no list yet. Add one in Edit survey.");
    return;
  }
  const selected = splitAnswer(survey[question.id]);
  const container = document.createElement("div");
  container.className = "tree-control";

  const toggle = (path, on) => {
    const next = new Set(selected);
    if (on) next.add(path);
    else next.delete(path);
    survey[question.id] = [...next].join(", ");
    debouncedSave();
    scheduleOutputs();
  };

  const build = (nodes, trail) => {
    const list = document.createElement("ul");
    list.className = "tree-list";
    for (const node of nodes) {
      const path = [...trail, node.label].join(" > ");
      const item = document.createElement("li");
      const label = document.createElement("label");
      label.className = "tree-option";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = selected.includes(path);
      input.addEventListener("change", () => toggle(path, input.checked));
      label.append(input, document.createTextNode(node.label));
      item.append(label);
      if (node.children.length) {
        const details = document.createElement("details");
        details.open = node.children.some((child) =>
          selected.some((value) => value.startsWith(`${path} > ${child.label}`))
        );
        const summary = document.createElement("summary");
        summary.textContent = `${node.children.length} under ${node.label}`;
        details.append(summary, build(node.children, [...trail, node.label]));
        item.append(details);
      }
      list.append(item);
    }
    return list;
  };

  container.append(build(roots, []));
  fieldset.append(container);
}

/* Pick, group and rank: a group dropdown per option, then up/down inside the
   group. Stored as "Group: 1. A, 2. B; Group: 1. C" -- one pair per group so a
   reader that only knows the "Label: value" convention still gets something
   meaningful out of it. */
function appendPickGroupRankControl(fieldset, survey, question) {
  const options = questionOptions(question, state.session);
  const groups = String(questionConfig(question).groups || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (!options.length || !groups.length) {
    surveyFieldsetNote(fieldset, "This needs both options and a list of groups. Add them in Edit survey.");
    return;
  }

  const assignment = new Map();
  for (const group of groups) {
    const raw = fieldAnswer(survey[question.id], group);
    const ordered = raw
      .split(",")
      .map((part) => part.replace(/^\s*\d+\.\s*/, "").trim())
      .filter(Boolean);
    assignment.set(group, ordered.filter((option) => options.includes(option)));
  }

  const commit = () => {
    let answer = "";
    for (const group of groups) {
      const members = assignment.get(group) || [];
      if (!members.length) continue;
      answer = setFieldAnswer(answer, group, members.map((option, index) => `${index + 1}. ${option}`).join(", "));
    }
    survey[question.id] = answer;
    debouncedSave();
    renderSurveyForm();
    renderOutputs();
  };

  const groupOf = (option) => groups.find((group) => (assignment.get(group) || []).includes(option)) || "";

  const unassigned = options.filter((option) => !groupOf(option));
  const board = document.createElement("div");
  board.className = "pick-group-board";

  const pool = document.createElement("div");
  pool.className = "pick-group-pool";
  const poolTitle = document.createElement("strong");
  poolTitle.textContent = unassigned.length ? "Not yet grouped" : "Everything is grouped";
  pool.append(poolTitle);
  for (const option of unassigned) {
    const row = document.createElement("div");
    row.className = "pick-group-row";
    const text = document.createElement("span");
    text.textContent = option;
    const select = document.createElement("select");
    const blank = document.createElement("option");
    blank.value = "";
    blank.textContent = "Put in…";
    select.append(blank);
    for (const group of groups) {
      const item = document.createElement("option");
      item.value = group;
      item.textContent = group;
      select.append(item);
    }
    select.addEventListener("change", () => {
      if (!select.value) return;
      assignment.get(select.value).push(option);
      commit();
    });
    row.append(text, select);
    pool.append(row);
  }
  board.append(pool);

  for (const group of groups) {
    const column = document.createElement("div");
    column.className = "pick-group-column";
    const title = document.createElement("strong");
    title.textContent = group;
    column.append(title);
    const members = assignment.get(group) || [];
    members.forEach((option, index) => {
      const row = document.createElement("div");
      row.className = "pick-group-row";
      const text = document.createElement("span");
      text.textContent = `${index + 1}. ${option}`;
      const controls = document.createElement("div");
      controls.className = "rank-order-controls";
      const up = document.createElement("button");
      up.type = "button";
      up.className = "quiet";
      up.textContent = "↑";
      up.setAttribute("aria-label", `Move ${option} up in ${group}`);
      up.disabled = index === 0;
      up.addEventListener("click", () => {
        [members[index - 1], members[index]] = [members[index], members[index - 1]];
        commit();
      });
      const down = document.createElement("button");
      down.type = "button";
      down.className = "quiet";
      down.textContent = "↓";
      down.setAttribute("aria-label", `Move ${option} down in ${group}`);
      down.disabled = index === members.length - 1;
      down.addEventListener("click", () => {
        [members[index], members[index + 1]] = [members[index + 1], members[index]];
        commit();
      });
      const out = document.createElement("button");
      out.type = "button";
      out.className = "quiet";
      out.textContent = "×";
      out.setAttribute("aria-label", `Take ${option} out of ${group}`);
      out.addEventListener("click", () => {
        members.splice(index, 1);
        commit();
      });
      controls.append(up, down, out);
      row.append(text, controls);
      column.append(row);
    });
    board.append(column);
  }
  fieldset.append(board);
}

/* Descriptive: the one type with no answer. It exists so a survey can carry a
   heading or a reminder without a stray empty field appearing in every export. */
function appendDescriptiveControl(fieldset, survey, question) {
  const config = questionConfig(question);
  const body = document.createElement("div");
  body.className = "descriptive-block";
  if (config.body) {
    const text = document.createElement("p");
    text.textContent = config.body;
    body.append(text);
  }
  if (config.image) {
    const image = document.createElement("img");
    image.src = config.image;
    image.alt = question.label || "";
    image.className = "descriptive-image";
    body.append(image);
  }
  if (!config.body && !config.image) {
    surveyFieldsetNote(fieldset, "Nothing to show yet. Add the text or picture in Edit survey.");
    return;
  }
  fieldset.append(body);
}

/* Side by side: several column groups over one set of rows. `config.columns` is
   an outline -- a column heading with its options indented under it -- reusing
   the same parser the tree types use rather than inventing a second format. */
function appendSideBySideControl(fieldset, survey, question) {
  const rows = questionRows(question);
  const columns = parseOutline(questionConfig(question).columns || "")
    .map((node) => ({ label: node.label, options: node.children.map((child) => child.label) }))
    .filter((column) => column.options.length);
  if (!rows.length || !columns.length) {
    surveyFieldsetNote(fieldset, "This needs rows and at least one column group with options under it. Add them in Edit survey.");
    return;
  }
  const scroller = document.createElement("div");
  scroller.className = "matrix-scroll";
  const table = document.createElement("table");
  table.className = "matrix-table side-by-side-table";
  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  headRow.append(document.createElement("th"));
  for (const column of columns) {
    const cell = document.createElement("th");
    cell.scope = "col";
    cell.textContent = column.label;
    headRow.append(cell);
  }
  head.append(headRow);
  table.append(head);

  const body = document.createElement("tbody");
  for (const row of rows) {
    const tr = document.createElement("tr");
    const label = document.createElement("th");
    label.scope = "row";
    label.textContent = row;
    tr.append(label);
    for (const column of columns) {
      const cell = document.createElement("td");
      const key = `${row} [${column.label}]`;
      const select = document.createElement("select");
      const blank = document.createElement("option");
      blank.value = "";
      blank.textContent = "—";
      select.append(blank);
      for (const option of column.options) {
        const item = document.createElement("option");
        item.value = option;
        item.textContent = option;
        select.append(item);
      }
      select.value = fieldAnswer(survey[question.id], key);
      select.setAttribute("aria-label", `${row}, ${column.label}`);
      select.addEventListener("change", () => {
        survey[question.id] = setFieldAnswer(survey[question.id], key, select.value);
        debouncedSave();
        scheduleOutputs();
      });
      cell.append(select);
      tr.append(cell);
    }
    body.append(tr);
  }
  table.append(body);
  scroller.append(table);
  fieldset.append(scroller);
}

/* Highlighter: the passage is split into words, each its own toggle. Adjacent
   highlighted words are coalesced back into runs on save, so the answer reads
   as the phrases that were picked out rather than a bag of words. */
function appendHighlighterControl(fieldset, survey, question) {
  const passage = String(questionConfig(question).body || "");
  if (!passage.trim()) {
    surveyFieldsetNote(fieldset, "This highlighter has no passage yet. Add one in Edit survey.");
    return;
  }
  const words = passage.split(/(\s+)/);
  const saved = splitAnswer(survey[question.id]);
  const picked = new Set();
  words.forEach((word, index) => {
    if (!word.trim()) return;
    if (saved.some((run) => run.split(/\s+/).includes(word.trim()))) picked.add(index);
  });

  const commit = () => {
    const runs = [];
    let current = [];
    words.forEach((word, index) => {
      if (picked.has(index)) current.push(word.trim());
      else if (word.trim() && current.length) {
        runs.push(current.join(" "));
        current = [];
      }
    });
    if (current.length) runs.push(current.join(" "));
    survey[question.id] = runs.join(", ");
    debouncedSave();
    scheduleOutputs();
  };

  const block = document.createElement("p");
  block.className = "highlighter-passage";
  words.forEach((word, index) => {
    if (!word.trim()) {
      block.append(document.createTextNode(word));
      return;
    }
    const span = document.createElement("span");
    span.className = picked.has(index) ? "highlighter-word is-picked" : "highlighter-word";
    span.textContent = word;
    span.setAttribute("role", "button");
    span.tabIndex = 0;
    const flip = () => {
      if (picked.has(index)) picked.delete(index);
      else picked.add(index);
      span.classList.toggle("is-picked", picked.has(index));
      commit();
    };
    span.addEventListener("click", flip);
    span.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        flip();
      }
    });
    block.append(span);
  });
  fieldset.append(block);
}

/* Hot spot and heat map both need a picture attached to the question. The
   regions for a hot spot are drawn on that picture in the question editor, not
   typed as coordinates -- co-ordinates entered by hand are unreadable and there
   is no way to tell a wrong one from a right one without seeing it. */
function appendHotSpotControl(fieldset, survey, question) {
  const config = questionConfig(question);
  const regions = Array.isArray(config.regions) ? config.regions : [];
  if (!config.image || !regions.length) {
    surveyFieldsetNote(fieldset, "This needs a picture with regions drawn on it. Set it up in Edit survey.");
    return;
  }
  const picked = splitAnswer(survey[question.id]);
  const stage = document.createElement("div");
  stage.className = "spot-stage";
  const image = document.createElement("img");
  image.src = config.image;
  image.alt = question.label || "";
  stage.append(image);
  for (const region of regions) {
    const hit = document.createElement("button");
    hit.type = "button";
    hit.className = picked.includes(region.name) ? "spot-region is-picked" : "spot-region";
    hit.style.left = `${region.x}%`;
    hit.style.top = `${region.y}%`;
    hit.style.width = `${region.w}%`;
    hit.style.height = `${region.h}%`;
    hit.title = region.name;
    hit.setAttribute("aria-label", region.name);
    hit.setAttribute("aria-pressed", String(picked.includes(region.name)));
    hit.addEventListener("click", () => {
      const next = new Set(picked);
      if (next.has(region.name)) next.delete(region.name);
      else next.add(region.name);
      survey[question.id] = [...next].join(", ");
      debouncedSave();
      renderSurveyForm();
      renderOutputs();
    });
    stage.append(hit);
  }
  fieldset.append(stage);
  surveyFieldsetNote(fieldset, picked.length ? `Picked: ${picked.join(", ")}` : "Nothing picked yet.");
}

function appendHeatMapControl(fieldset, survey, question) {
  const config = questionConfig(question);
  if (!config.image) {
    surveyFieldsetNote(fieldset, "This needs a picture. Add one in Edit survey.");
    return;
  }
  const points = splitAnswer(survey[question.id]);
  const stage = document.createElement("div");
  stage.className = "spot-stage is-heatmap";
  const image = document.createElement("img");
  image.src = config.image;
  image.alt = question.label || "";
  stage.append(image);
  points.forEach((point) => {
    const match = /\(?\s*([\d.]+)\s*,\s*([\d.]+)\s*\)?/.exec(point);
    if (!match) return;
    const dot = document.createElement("span");
    dot.className = "heat-dot";
    dot.style.left = `${match[1]}%`;
    dot.style.top = `${match[2]}%`;
    stage.append(dot);
  });
  image.addEventListener("click", (event) => {
    const box = image.getBoundingClientRect();
    const x = Math.round(((event.clientX - box.left) / box.width) * 1000) / 10;
    const y = Math.round(((event.clientY - box.top) / box.height) * 1000) / 10;
    survey[question.id] = [...points, `(${x}, ${y})`].join(", ");
    debouncedSave();
    renderSurveyForm();
    renderOutputs();
  });
  fieldset.append(stage);

  const row = document.createElement("div");
  row.className = "add-choice-row";
  const note = document.createElement("span");
  note.className = "survey-type-note";
  note.textContent = points.length ? `${points.length} point${points.length === 1 ? "" : "s"} marked` : "Click the picture to mark a point.";
  row.append(note);
  if (points.length) {
    const clear = document.createElement("button");
    clear.type = "button";
    clear.className = "quiet danger";
    clear.textContent = "Clear points";
    clear.addEventListener("click", () => {
      survey[question.id] = "";
      debouncedSave();
      renderSurveyForm();
      renderOutputs();
    });
    row.append(clear);
  }
  fieldset.append(row);
}

const SURVEY_CONTROL_RENDERERS = {
  matrix: appendMatrixControl,
  rankOrder: appendRankOrderControl,
  constantSum: appendConstantSumControl,
  nps: appendNpsControl,
  drillDown: appendDrillDownControl,
  tree: appendTreeControl,
  pickGroupRank: appendPickGroupRankControl,
  descriptive: appendDescriptiveControl,
  sideBySide: appendSideBySideControl,
  highlighter: appendHighlighterControl,
  hotSpot: appendHotSpotControl,
  heatMap: appendHeatMapControl,
  fileUpload: (fieldset, survey, question) => appendMediaControl(fieldset, survey, question, "file"),
  audio: (fieldset, survey, question) => appendMediaControl(fieldset, survey, question, "audio"),
  video: (fieldset, survey, question) => appendMediaControl(fieldset, survey, question, "video"),
  signature: appendSignatureControl
};

function appendTextImageControl(fieldset, survey, question) {
  const answer = normalizeTextImageAnswer(survey[question.id]);
  survey[question.id] = answer;
  const wrapper = document.createElement("div");
  wrapper.className = "text-image-control single-answer";

  const textLabel = document.createElement("label");
  textLabel.className = "field-control";
  const textCaption = document.createElement("span");
  textCaption.textContent = "Your answer";
  const textarea = document.createElement("textarea");
  textarea.value = answer.text;
  textarea.addEventListener("input", () => {
    answer.text = textarea.value;
    debouncedSave();
    scheduleOutputs();
  });
  textLabel.append(textCaption, textarea);

  const imageArea = document.createElement("div");
  imageArea.className = "text-image-area";
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.className = "visually-hidden";
  const chooseButton = document.createElement("button");
  chooseButton.type = "button";
  chooseButton.className = "quiet";
  chooseButton.textContent = answer.image?.url ? "Replace picture" : "Add picture";
  chooseButton.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    chooseButton.disabled = true;
    chooseButton.textContent = "Adding picture...";
    try {
      const image = await uploadSurveyImage(file, question.id);
      answer.image = image;
      debouncedSave();
      renderSurveyForm();
      renderOutputs();
    } catch (error) {
      chooseButton.disabled = false;
      chooseButton.textContent = answer.image?.url ? "Replace picture" : "Add picture";
      if (els.saveStatus) els.saveStatus.textContent = error.message || "Could not add picture";
    }
  });
  imageArea.append(fileInput, chooseButton);

  if (answer.image?.url) {
    const preview = document.createElement("img");
    preview.className = "survey-image-preview";
    preview.src = answer.image.url;
    preview.alt = `Picture for: ${question.label}`;
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "quiet danger";
    removeButton.textContent = "Remove picture";
    removeButton.addEventListener("click", () => {
      answer.image = null;
      debouncedSave();
      renderSurveyForm();
      renderOutputs();
    });
    imageArea.prepend(preview);
    imageArea.append(removeButton);
  }

  wrapper.append(textLabel, imageArea);
  fieldset.append(wrapper);
}

function normalizeTextImageAnswer(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return {
      text: String(value.text || ""),
      image: value.image?.url ? { ...value.image, url: String(value.image.url) } : null
    };
  }
  return { text: String(value || ""), image: null };
}

/* --- Attachments ------------------------------------------------------------

   File, audio and video answers all keep the same shape: { text, files: [] },
   an extension of the { text, image } that `textImage` already stores. Sharing
   the `text` key is deliberate -- `surveyAnswerIsReal()` and its server twin
   already treat an object with text as answered, so an attachment question did
   not need either of them re-taught.

   Recording is offered where the browser has MediaRecorder and falls back to
   the file picker where it does not. The picker is always there: a voice note
   already on the phone is the common case, not the rare one.
--------------------------------------------------------------------------- */

function normalizeMediaAnswer(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return {
      text: String(value.text || ""),
      image: value.image?.url ? { ...value.image, url: String(value.image.url) } : null,
      files: Array.isArray(value.files)
        ? value.files.filter((file) => file?.url).map((file) => ({ ...file, url: String(file.url) }))
        : []
    };
  }
  return { text: String(value || ""), image: null, files: [] };
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });
}

async function uploadSurveyFile(file, questionId, suggestedName) {
  const dataUrl = await fileToDataUrl(file);
  const response = await fetch("/api/survey-file", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date: state.currentDate,
      questionId,
      name: suggestedName || file.name || "attachment",
      dataUrl
    })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.url) throw new Error(result.error || "Could not attach that file.");
  return {
    url: result.url,
    name: suggestedName || file.name || "attachment",
    type: file.type || "",
    size: file.size || 0,
    uploadedAt: new Date().toISOString()
  };
}

const MEDIA_CONTROL_KINDS = {
  file: { accept: "", label: "Add file", recordable: false, noun: "file" },
  audio: { accept: "audio/*", label: "Add audio file", recordable: true, noun: "recording", mime: "audio/webm" },
  video: { accept: "video/*", label: "Add video file", recordable: true, noun: "video", mime: "video/webm" }
};

function formatAttachmentSize(bytes) {
  const size = Number(bytes) || 0;
  if (!size) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${Math.round((size / (1024 * 1024)) * 10) / 10} MB`;
}

function appendMediaControl(fieldset, survey, question, kind) {
  const spec = MEDIA_CONTROL_KINDS[kind] || MEDIA_CONTROL_KINDS.file;
  const answer = normalizeMediaAnswer(survey[question.id]);
  survey[question.id] = answer;

  const wrapper = document.createElement("div");
  wrapper.className = "media-control single-answer";

  const textLabel = document.createElement("label");
  textLabel.className = "field-control";
  const caption = document.createElement("span");
  caption.textContent = "Notes";
  const textarea = document.createElement("textarea");
  textarea.value = answer.text;
  textarea.addEventListener("input", () => {
    answer.text = textarea.value;
    debouncedSave();
    scheduleOutputs();
  });
  textLabel.append(caption, textarea);
  wrapper.append(textLabel);

  const list = document.createElement("div");
  list.className = "attachment-list";
  for (const [index, file] of answer.files.entries()) {
    const row = document.createElement("div");
    row.className = "attachment-row";
    if (kind === "audio") {
      const player = document.createElement("audio");
      player.controls = true;
      player.src = file.url;
      row.append(player);
    } else if (kind === "video") {
      const player = document.createElement("video");
      player.controls = true;
      player.src = file.url;
      player.className = "attachment-video";
      row.append(player);
    }
    const link = document.createElement("a");
    link.href = file.url;
    link.target = "_blank";
    link.rel = "noopener";
    link.className = "attachment-name";
    const size = formatAttachmentSize(file.size);
    link.textContent = size ? `${file.name} (${size})` : file.name;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "quiet danger";
    remove.textContent = "Remove";
    remove.setAttribute("aria-label", `Remove ${file.name}`);
    remove.addEventListener("click", () => {
      answer.files.splice(index, 1);
      debouncedSave();
      renderSurveyForm();
      renderOutputs();
    });
    row.append(link, remove);
    list.append(row);
  }
  wrapper.append(list);

  const controls = document.createElement("div");
  controls.className = "attachment-controls";
  const status = document.createElement("span");
  status.className = "survey-type-note";

  const input = document.createElement("input");
  input.type = "file";
  if (spec.accept) input.accept = spec.accept;
  input.multiple = kind === "file";
  input.className = "visually-hidden";
  input.addEventListener("change", async () => {
    const chosen = Array.from(input.files || []);
    input.value = "";
    for (const file of chosen) {
      status.textContent = `Attaching ${file.name}…`;
      try {
        answer.files.push(await uploadSurveyFile(file, question.id));
        status.textContent = "";
      } catch (error) {
        status.textContent = error.message;
        break;
      }
    }
    await saveEverywhere();
    renderSurveyForm();
    renderOutputs();
  });

  const choose = document.createElement("button");
  choose.type = "button";
  choose.className = "quiet";
  choose.textContent = spec.label;
  choose.addEventListener("click", () => input.click());
  controls.append(choose, input);

  if (spec.recordable && typeof MediaRecorder !== "undefined" && navigator.mediaDevices?.getUserMedia) {
    const record = document.createElement("button");
    record.type = "button";
    record.className = "quiet";
    record.textContent = `Record ${spec.noun}`;
    let recorder = null;
    let stream = null;
    record.addEventListener("click", async () => {
      if (recorder && recorder.state === "recording") {
        recorder.stop();
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia(kind === "video" ? { audio: true, video: true } : { audio: true });
      } catch {
        status.textContent = "No microphone or camera available.";
        return;
      }
      const chunks = [];
      recorder = new MediaRecorder(stream);
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data?.size) chunks.push(event.data);
      });
      recorder.addEventListener("stop", async () => {
        for (const track of stream.getTracks()) track.stop();
        record.textContent = `Record ${spec.noun}`;
        record.classList.remove("is-recording");
        // Drop the codec parameters MediaRecorder appends. The bytes are the
        // same; the server keys its extension table on the bare type.
        const recordedType = String(recorder.mimeType || spec.mime).split(";")[0];
        const blob = new Blob(chunks, { type: recordedType });
        const stamp = new Date().toISOString().replace(/[:.]/g, "-");
        const extension = recordedType.includes("mp4") ? "mp4" : kind === "audio" ? "weba" : "webm";
        status.textContent = "Saving recording…";
        try {
          answer.files.push(await uploadSurveyFile(blob, question.id, `${spec.noun}-${stamp}.${extension}`));
          status.textContent = "";
        } catch (error) {
          status.textContent = error.message;
        }
        await saveEverywhere();
        renderSurveyForm();
        renderOutputs();
      });
      recorder.start();
      record.textContent = "Stop recording";
      record.classList.add("is-recording");
    });
    controls.append(record);
  }

  controls.append(status);
  wrapper.append(controls);
  fieldset.append(wrapper);
}

/* Signature: drawn on a canvas, saved through the picture endpoint as a PNG.
   Reusing /api/survey-image rather than the file endpoint keeps the result in
   the same media folder as every other picture the survey holds. */
function appendSignatureControl(fieldset, survey, question) {
  const answer = normalizeMediaAnswer(survey[question.id]);
  survey[question.id] = answer;
  const wrapper = document.createElement("div");
  wrapper.className = "signature-control single-answer";

  if (answer.image?.url) {
    const preview = document.createElement("img");
    preview.className = "signature-preview";
    preview.src = answer.image.url;
    preview.alt = `Signature for: ${question.label}`;
    const clear = document.createElement("button");
    clear.type = "button";
    clear.className = "quiet danger";
    clear.textContent = "Sign again";
    clear.addEventListener("click", () => {
      answer.image = null;
      debouncedSave();
      renderSurveyForm();
      renderOutputs();
    });
    wrapper.append(preview, clear);
    fieldset.append(wrapper);
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.className = "signature-pad";
  canvas.width = 600;
  canvas.height = 200;
  const context = canvas.getContext("2d");
  context.lineWidth = 2.5;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = "#1d2528";
  let drawing = false;
  let marked = false;

  const pointAt = (event) => {
    const box = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - box.left) / box.width) * canvas.width,
      y: ((event.clientY - box.top) / box.height) * canvas.height
    };
  };
  canvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    drawing = true;
    marked = true;
    const point = pointAt(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!drawing) return;
    const point = pointAt(event);
    context.lineTo(point.x, point.y);
    context.stroke();
  });
  const finish = () => {
    drawing = false;
  };
  canvas.addEventListener("pointerup", finish);
  canvas.addEventListener("pointercancel", finish);

  const status = document.createElement("span");
  status.className = "survey-type-note";
  const row = document.createElement("div");
  row.className = "attachment-controls";
  const save = document.createElement("button");
  save.type = "button";
  save.className = "quiet";
  save.textContent = "Save signature";
  save.addEventListener("click", async () => {
    if (!marked) {
      status.textContent = "Nothing drawn yet.";
      return;
    }
    status.textContent = "Saving…";
    try {
      const response = await fetch("/api/survey-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: state.currentDate, questionId: question.id, dataUrl: canvas.toDataURL("image/png") })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.url) throw new Error(result.error || "Could not save the signature.");
      answer.image = { url: result.url, name: "signature.png", uploadedAt: new Date().toISOString() };
      await saveEverywhere();
      renderSurveyForm();
      renderOutputs();
    } catch (error) {
      status.textContent = error.message;
    }
  });
  const clear = document.createElement("button");
  clear.type = "button";
  clear.className = "quiet";
  clear.textContent = "Clear";
  clear.addEventListener("click", () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    marked = false;
    status.textContent = "";
  });
  row.append(save, clear, status);
  wrapper.append(canvas, row);
  fieldset.append(wrapper);
}

async function uploadSurveyImage(file, questionId) {
  if (!String(file.type || "").startsWith("image/")) throw new Error("Please choose an image file.");
  const dataUrl = await resizeImageForJournal(file);
  const response = await fetch("/api/survey-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date: state.currentDate, questionId, name: file.name, dataUrl })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Could not add picture.");
  return { url: result.url, name: file.name, uploadedAt: new Date().toISOString() };
}

async function resizeImageForJournal(file) {
  const bitmap = await createImageBitmap(file);
  const maxSide = 1800;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.86);
}

function allQuestionChoices(question, sessionName) {
  return [...(question.choices || []), ...(state.customChoices?.[sessionName]?.[question.id] || [])];
}

function questionChoices(question, sessionName, dateString = state.currentDate) {
  const baseDisplays = new Set((question.choices || []).map((choice) => normalize(choiceDisplay(choice))));
  return allQuestionChoices(question, sessionName).filter((choice) => {
    const display = choiceDisplay(choice);
    return isChoiceVisibleOn(sessionName, question.id, display, dateString, baseDisplays.has(normalize(display)));
  });
}

function choiceDisplay(choice) {
  return typeof choice === "string" ? choice : choice.display;
}

function addPersistentChoice(sessionName, questionId, value, options = {}) {
  ensureCustomChoiceState();
  const display = typeof value === "string" ? value.trim() : String(value.display || "").trim();
  if (!display) return null;
  if (!state.customChoices[sessionName][questionId]) state.customChoices[sessionName][questionId] = [];
  const existing = state.customChoices[sessionName][questionId].find((choice) => normalize(choice.display) === normalize(display));
  if (existing) {
    if (options.effectiveFrom) recordChoiceEvent(sessionName, questionId, display, options.effectiveFrom, "add");
    return existing;
  }
  if (options.effectiveFrom) recordChoiceEvent(sessionName, questionId, display, options.effectiveFrom, "add");
  const choice = {
    choiceId: typeof value === "object" && value.choiceId ? String(value.choiceId) : nextCustomChoiceId(sessionName, questionId),
    display
  };
  state.customChoices[sessionName][questionId].push(choice);
  return choice;
}

function nextCustomChoiceId(sessionName, questionId) {
  const base = BASE_NEXT_CHOICE_IDS[sessionName]?.[questionId] || 1;
  const existingIds = (state.customChoices?.[sessionName]?.[questionId] || [])
    .map((choice) => Number(choice.choiceId))
    .filter(Number.isFinite);
  return String(Math.max(base, ...existingIds.map((id) => id + 1)));
}

function appendAddChoiceControl(fieldset, question, session) {
  const row = document.createElement("div");
  row.className = "add-choice-row";
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Add option";
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Add";
  const addChoice = () => {
    const value = input.value.trim();
    if (!value) return;
    const known = allQuestionChoices(question, state.session).map((choice) => normalize(choiceDisplay(choice)));
    if (!known.includes(normalize(value))) {
      addPersistentChoice(state.session, question.id, value, { effectiveFrom: state.currentDate });
    } else if (!questionChoices(question, state.session).some((choice) => normalize(choiceDisplay(choice)) === normalize(value))) {
      recordChoiceEvent(state.session, question.id, value, state.currentDate, "add");
    }
    if (question.type === "multi") {
      const selected = splitAnswer(session.survey[question.id]);
      if (!selected.includes(value)) selected.push(value);
      session.survey[question.id] = selected.join(", ");
    } else {
      session.survey[question.id] = value;
    }
    input.value = "";
    saveCustomChoices();
    saveEverywhere();
    renderSidePanel();
    renderSurveyForm();
    renderOutputs();
  };
  button.addEventListener("click", addChoice);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addChoice();
    }
  });
  row.append(input, button);
  fieldset.append(row);
}

function removeSurveyChoice(question, display) {
  const onward = formatDateLine(state.currentDate);
  if (!confirm(`Remove "${display}" from "${surveyDisplayLabel(question)}"?\n\nIt disappears from ${onward} onward. Earlier days keep it.`)) return;
  recordChoiceEvent(state.session, question.id, display, state.currentDate, "remove");
  const session = currentSession();
  const kept = splitAnswer(session.survey[question.id]).filter((value) => normalize(value) !== normalize(display));
  session.survey[question.id] = kept.join(", ");
  saveCustomChoices();
  saveEverywhere();
  renderSidePanel();
  renderSurveyForm();
  renderOutputs();
}

function removeSurveyQuestion(question) {
  const onward = formatDateLine(state.currentDate);
  if (!confirm(`Remove the whole question "${surveyDisplayLabel(question)}"?\n\nIt disappears from ${onward} onward. Earlier days keep it, and answers already saved are not deleted.`)) return;
  recordQuestionEvent(state.session, question.id, state.currentDate, "remove");
  saveCustomChoices();
  saveEverywhere();
  renderSidePanel();
  renderSurveyForm();
  renderOutputs();
}

function restoreSurveyQuestion(question) {
  recordQuestionEvent(state.session, question.id, state.currentDate, "add");
  saveCustomChoices();
  saveEverywhere();
  renderSidePanel();
  renderSurveyForm();
  renderOutputs();
}

/* --- Writing a question -----------------------------------------------------

   The editor folds out of the edit bar and writes into `customQuestions` in
   custom-choices.json. Two decisions worth keeping:

   A new question is effective-dated to the day it was written, exactly like a
   new choice. Ticking a box on 1 September must not put an unanswered question
   on 400 days of history, and it must not make those days start reading as
   incomplete to the goal sweep.

   The `id` is derived from the label once, at creation, and then frozen. The
   id is the key every answer is filed under, so renaming a question later
   changes what it says and not where its history lives.
--------------------------------------------------------------------------- */

let surveyQuestionDraft = null;

function slugifyQuestionId(label) {
  return String(label || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function newCustomQuestionId(sessionName, label) {
  const taken = new Set(allSurveyQuestions(sessionName).map((question) => question.id));
  const base = slugifyQuestionId(label) || "question";
  if (!taken.has(base)) return base;
  for (let suffix = 2; suffix < 500; suffix += 1) {
    const candidate = `${base}-${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${Date.now()}`;
}

function blankQuestionDraft() {
  return { mode: "new", id: "", type: "text", label: "", prompt: "", choices: "", fields: "", config: {} };
}

function draftFromQuestion(question) {
  const config = questionConfig(question);
  return {
    mode: "edit",
    id: question.id,
    type: question.type,
    label: question.label || "",
    prompt: question.prompt || "",
    choices: (question.choices || []).map((choice) => choiceDisplay(choice)).join("\n"),
    fields: (question.fields || []).join("\n"),
    config: { ...config }
  };
}

function openQuestionEditor(draft) {
  surveyQuestionDraft = draft;
  renderSurveyForm();
  // The form is rebuilt from scratch, so the caret has to be put back by hand.
  els.formView.querySelector(".question-editor input, .question-editor textarea")?.focus();
}

function closeQuestionEditor() {
  surveyQuestionDraft = null;
  renderSurveyForm();
}

function draftNeeds(draft, key) {
  return (questionType(draft.type)?.config || []).includes(key);
}

function commitQuestionDraft() {
  const draft = surveyQuestionDraft;
  if (!draft) return;
  const label = draft.label.trim();
  if (!label) {
    alert("Give the question a label first.");
    return;
  }
  const type = questionType(draft.type);
  if (!type) return;

  const lines = (value) =>
    String(value || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

  const question = {
    id: draft.mode === "edit" ? draft.id : newCustomQuestionId(state.session, label),
    custom: true,
    type: draft.type,
    label,
    prompt: draft.prompt.trim() || label,
    createdOn: draft.mode === "edit" ? draft.createdOn || state.currentDate : state.currentDate,
    config: { ...draft.config }
  };
  if (draftNeeds(draft, "choices")) question.choices = lines(draft.choices);
  if (draftNeeds(draft, "fields")) question.fields = lines(draft.fields);

  ensureCustomChoiceState();
  const list = state.customChoices.customQuestions[state.session];
  const existingIndex = list.findIndex((item) => item.id === question.id);
  if (existingIndex > -1) {
    question.createdOn = list[existingIndex].createdOn || question.createdOn;
    list[existingIndex] = question;
  } else {
    list.push(question);
    // Effective from today, like every other survey edit.
    recordQuestionEvent(state.session, question.id, state.currentDate, "add");
    // New questions land at the end unless the order list already has opinions.
    const order = state.customChoices.questionOrder[state.session];
    if (order.length) order.push(question.id);
  }

  surveyQuestionDraft = null;
  saveCustomChoices();
  saveEverywhere();
  renderSidePanel();
  renderSurveyForm();
  renderOutputs();
}

function deleteCustomQuestion(question) {
  if (
    !confirm(
      `Delete "${surveyDisplayLabel(question)}" completely?\n\nThis removes the question itself, not just from today onward. Answers already saved under it stay in the entries but nothing will show them.\n\nTo keep the history readable, use "Remove question" instead — that hides it from ${formatDateLine(state.currentDate)} onward.`
    )
  ) {
    return;
  }
  ensureCustomChoiceState();
  const list = state.customChoices.customQuestions[state.session];
  const index = list.findIndex((item) => item.id === question.id);
  if (index > -1) list.splice(index, 1);
  delete state.customChoices.questionHistory[state.session][question.id];
  state.customChoices.questionOrder[state.session] = state.customChoices.questionOrder[state.session].filter(
    (id) => id !== question.id
  );
  surveyQuestionDraft = null;
  saveCustomChoices();
  saveEverywhere();
  renderSidePanel();
  renderSurveyForm();
  renderOutputs();
}

// Reordering is a property of the survey, not of a date: a question moved up
// moves everywhere. Ordering carries no answers with it, so unlike an add or a
// remove there is nothing about an earlier day that a reorder could falsify.
function moveSurveyQuestion(question, direction) {
  ensureCustomChoiceState();
  const current = visibleSurveyQuestions(state.session).map((item) => item.id);
  const index = current.indexOf(question.id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= current.length) return;
  [current[index], current[target]] = [current[target], current[index]];
  // Questions hidden today keep their place relative to the ones around them by
  // being appended in their existing order after the visible list.
  const rest = allSurveyQuestions(state.session)
    .map((item) => item.id)
    .filter((id) => !current.includes(id));
  state.customChoices.questionOrder[state.session] = [...current, ...rest];
  saveCustomChoices();
  saveEverywhere();
  renderSurveyForm();
  renderOutputs();
}

function labelledEditorField(labelText, hint, control) {
  const wrap = document.createElement("label");
  wrap.className = "field-control question-editor-field";
  const caption = document.createElement("span");
  caption.textContent = labelText;
  wrap.append(caption);
  if (hint) {
    const small = document.createElement("small");
    small.textContent = hint;
    wrap.append(small);
  }
  wrap.append(control);
  return wrap;
}

function editorTextarea(value, onInput, rows = 4) {
  const area = document.createElement("textarea");
  area.rows = rows;
  area.value = value || "";
  area.addEventListener("input", () => onInput(area.value));
  return area;
}

function appendQuestionEditor() {
  if (!surveyQuestionDraft) return;
  const draft = surveyQuestionDraft;
  const panel = document.createElement("section");
  panel.className = "question-editor";

  const heading = document.createElement("h3");
  heading.textContent = draft.mode === "edit" ? `Edit "${draft.label || draft.id}"` : "Add a question";
  panel.append(heading);

  const labelInput = document.createElement("input");
  labelInput.type = "text";
  labelInput.value = draft.label;
  labelInput.placeholder = "What are you asking?";
  labelInput.addEventListener("input", () => {
    draft.label = labelInput.value;
  });
  panel.append(labelledEditorField("Question", "", labelInput));

  const typeSelect = document.createElement("select");
  for (const type of addableQuestionTypes()) {
    const option = document.createElement("option");
    option.value = type.key;
    option.textContent = type.label;
    typeSelect.append(option);
  }
  // A question already using a type that has since been switched off in
  // Settings still has to be editable, so its own type is added back in.
  if (!addableQuestionTypes().some((type) => type.key === draft.type)) {
    const option = document.createElement("option");
    option.value = draft.type;
    option.textContent = `${questionTypeLabel(draft.type)} (switched off in Settings)`;
    typeSelect.append(option);
  }
  typeSelect.value = draft.type;
  typeSelect.addEventListener("change", () => {
    draft.type = typeSelect.value;
    openQuestionEditor(draft);
  });
  panel.append(labelledEditorField("Type", questionType(draft.type)?.description || "", typeSelect));

  if (draftNeeds(draft, "choices")) {
    panel.append(
      labelledEditorField(
        "Options",
        "One per line.",
        editorTextarea(draft.choices, (value) => {
          draft.choices = value;
        }, 6)
      )
    );
  }
  if (draftNeeds(draft, "fields")) {
    panel.append(
      labelledEditorField(
        draft.type === "matrix" || draft.type === "sideBySide" ? "Rows" : "Fields",
        "One per line. In a form, a field starting \"Time I\" gets a clock picker.",
        editorTextarea(draft.fields, (value) => {
          draft.fields = value;
        }, 5)
      )
    );
  }
  if (draftNeeds(draft, "scale")) {
    const row = document.createElement("div");
    row.className = "question-editor-row";
    for (const [key, caption, fallback] of [["min", "Lowest", 0], ["max", "Highest", 5]]) {
      const input = document.createElement("input");
      input.type = "number";
      input.value = draft.config[key] ?? fallback;
      input.addEventListener("input", () => {
        draft.config[key] = input.value;
      });
      row.append(labelledEditorField(caption, "", input));
    }
    panel.append(row);
  }
  if (draftNeeds(draft, "total")) {
    const input = document.createElement("input");
    input.type = "number";
    input.value = draft.config.total ?? 100;
    input.addEventListener("input", () => {
      draft.config.total = input.value;
    });
    panel.append(labelledEditorField("Total to divide up", "100 for percentages, 24 for hours in a day.", input));
  }
  if (draftNeeds(draft, "tree")) {
    panel.append(
      labelledEditorField(
        "List",
        "One per line. Indent two spaces to nest underneath the line above.",
        editorTextarea(draft.config.tree, (value) => {
          draft.config.tree = value;
        }, 8)
      )
    );
  }
  if (draftNeeds(draft, "columns")) {
    panel.append(
      labelledEditorField(
        "Column groups",
        "A heading per line, with its options indented two spaces underneath.",
        editorTextarea(draft.config.columns, (value) => {
          draft.config.columns = value;
        }, 8)
      )
    );
  }
  if (draftNeeds(draft, "groups")) {
    panel.append(
      labelledEditorField(
        "Groups",
        "One per line.",
        editorTextarea(draft.config.groups, (value) => {
          draft.config.groups = value;
        }, 4)
      )
    );
  }
  if (draftNeeds(draft, "body")) {
    panel.append(
      labelledEditorField(
        draft.type === "highlighter" ? "Passage to highlight" : "Text to show",
        "",
        editorTextarea(draft.config.body, (value) => {
          draft.config.body = value;
        }, 6)
      )
    );
  }
  if (draftNeeds(draft, "image") || draft.type === "descriptive") {
    panel.append(questionEditorImageBlock(draft));
  }
  if (draftNeeds(draft, "regions")) {
    panel.append(questionEditorRegionBlock(draft));
  }

  const actions = document.createElement("div");
  actions.className = "question-editor-actions";
  const save = document.createElement("button");
  save.type = "button";
  save.textContent = draft.mode === "edit" ? "Save changes" : "Add question";
  save.addEventListener("click", commitQuestionDraft);
  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "quiet";
  cancel.textContent = "Cancel";
  cancel.addEventListener("click", closeQuestionEditor);
  actions.append(save, cancel);

  if (draft.mode === "edit") {
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "quiet danger";
    remove.textContent = "Delete completely";
    remove.title = "Removes the question from every day, past included";
    remove.addEventListener("click", () => {
      const question = surveyQuestionById(state.session, draft.id);
      if (question) deleteCustomQuestion(question);
    });
    actions.append(remove);
  }

  if (draft.mode === "new") {
    const note = document.createElement("p");
    note.className = "survey-edit-note";
    note.textContent = `It will appear from ${formatDateLine(state.currentDate)} onward. Earlier days are left as they are.`;
    panel.append(note);
  }
  panel.append(actions);
  els.formView.append(panel);
}

function questionEditorImageBlock(draft) {
  const block = document.createElement("div");
  block.className = "question-editor-field";
  const caption = document.createElement("span");
  caption.textContent = "Picture";
  block.append(caption);

  if (draft.config.image) {
    const preview = document.createElement("img");
    preview.src = draft.config.image;
    preview.alt = "";
    preview.className = "question-editor-image";
    block.append(preview);
  }

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.className = "visually-hidden";
  const status = document.createElement("span");
  status.className = "survey-type-note";
  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    status.textContent = "Uploading…";
    try {
      const uploaded = await uploadSurveyImage(file, draft.id || "question");
      draft.config.image = uploaded.url;
      // A new picture invalidates regions drawn on the old one.
      if (draft.config.regions) draft.config.regions = [];
      openQuestionEditor(draft);
    } catch (error) {
      status.textContent = error.message;
    }
  });
  const choose = document.createElement("button");
  choose.type = "button";
  choose.className = "quiet";
  choose.textContent = draft.config.image ? "Replace picture" : "Choose picture";
  choose.addEventListener("click", () => input.click());
  block.append(choose, input, status);
  return block;
}

/* Regions are dragged onto the picture rather than typed as numbers. Four
   percentages entered by hand cannot be checked by eye, so a wrong region would
   only be discovered by someone answering the question. */
function questionEditorRegionBlock(draft) {
  const block = document.createElement("div");
  block.className = "question-editor-field";
  const caption = document.createElement("span");
  caption.textContent = "Regions";
  const hint = document.createElement("small");
  hint.textContent = draft.config.image
    ? "Drag a box on the picture to add a region, then name it."
    : "Choose a picture first.";
  block.append(caption, hint);
  if (!draft.config.image) return block;

  if (!Array.isArray(draft.config.regions)) draft.config.regions = [];
  const regions = draft.config.regions;

  const stage = document.createElement("div");
  stage.className = "spot-stage is-editing";
  const image = document.createElement("img");
  image.src = draft.config.image;
  image.alt = "";
  image.draggable = false;
  stage.append(image);
  for (const [index, region] of regions.entries()) {
    const box = document.createElement("button");
    box.type = "button";
    box.className = "spot-region is-defined";
    box.style.left = `${region.x}%`;
    box.style.top = `${region.y}%`;
    box.style.width = `${region.w}%`;
    box.style.height = `${region.h}%`;
    box.title = `${region.name} — click to delete`;
    box.textContent = region.name;
    box.addEventListener("click", () => {
      regions.splice(index, 1);
      openQuestionEditor(draft);
    });
    stage.append(box);
  }

  let start = null;
  const marquee = document.createElement("div");
  marquee.className = "spot-marquee";
  marquee.hidden = true;
  stage.append(marquee);

  const pointPercent = (event) => {
    const box = stage.getBoundingClientRect();
    return {
      x: Math.min(100, Math.max(0, ((event.clientX - box.left) / box.width) * 100)),
      y: Math.min(100, Math.max(0, ((event.clientY - box.top) / box.height) * 100))
    };
  };
  stage.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".spot-region")) return;
    event.preventDefault();
    stage.setPointerCapture(event.pointerId);
    start = pointPercent(event);
    marquee.hidden = false;
  });
  stage.addEventListener("pointermove", (event) => {
    if (!start) return;
    const now = pointPercent(event);
    marquee.style.left = `${Math.min(start.x, now.x)}%`;
    marquee.style.top = `${Math.min(start.y, now.y)}%`;
    marquee.style.width = `${Math.abs(now.x - start.x)}%`;
    marquee.style.height = `${Math.abs(now.y - start.y)}%`;
  });
  stage.addEventListener("pointerup", (event) => {
    if (!start) return;
    const now = pointPercent(event);
    const rect = {
      x: Math.round(Math.min(start.x, now.x) * 10) / 10,
      y: Math.round(Math.min(start.y, now.y) * 10) / 10,
      w: Math.round(Math.abs(now.x - start.x) * 10) / 10,
      h: Math.round(Math.abs(now.y - start.y) * 10) / 10
    };
    start = null;
    marquee.hidden = true;
    if (rect.w < 2 || rect.h < 2) return;
    const name = prompt("Name this region:");
    if (!name?.trim()) return;
    regions.push({ ...rect, name: name.trim() });
    openQuestionEditor(draft);
  });

  block.append(stage);
  return block;
}

function labeledTextControl(labelText, value, onInput) {
  return labeledInputControl(labelText, value, "text", onInput);
}

function labeledTimeControl(labelText, value, onInput) {
  const parsed = timeForDisplay(value);
  const label = document.createElement("label");
  label.className = "field-control time-control";
  const span = document.createElement("span");
  span.textContent = labelText;
  const row = document.createElement("div");
  row.className = "time-row";
  const input = document.createElement("input");
  input.type = "text";
  input.inputMode = "numeric";
  input.placeholder = "h:mm";
  input.value = parsed.time;
  const select = document.createElement("select");
  select.innerHTML = `<option value="AM">AM</option><option value="PM">PM</option>`;
  select.value = parsed.meridiem;
  const update = () => {
    onInput(toMilitaryTime(input.value, select.value));
    debouncedSave();
    scheduleOutputs();
  };
  input.addEventListener("input", update);
  select.addEventListener("change", update);
  row.append(input, select);
  label.append(span, row);
  return label;
}

function labeledInputControl(labelText, value, type, onInput) {
  const label = document.createElement("label");
  label.className = "field-control";
  const span = document.createElement("span");
  span.textContent = labelText;
  const input = document.createElement("input");
  input.type = type;
  input.value = value || "";
  input.addEventListener("input", () => {
    onInput(input.value);
    debouncedSave();
    scheduleOutputs();
  });
  label.append(span, input);
  return label;
}

function appendWeightControl(fieldset, survey) {
  const wrapper = document.createElement("div");
  wrapper.className = "field-control weight-control single-answer";
  const labelText = document.createElement("span");
  labelText.textContent = "Weight (lbs)";
  const row = document.createElement("div");
  row.className = "weight-row";
  const input = document.createElement("input");
  input.type = "number";
  input.step = "0.1";
  const didNotMeasure = survey.weight === "Didn't measure";
  input.value = didNotMeasure ? "" : survey.weight || "";
  input.disabled = didNotMeasure;

  const checkboxLabel = document.createElement("label");
  checkboxLabel.className = "choice-option compact-choice-option";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = didNotMeasure;
  checkboxLabel.append(checkbox, document.createTextNode("Didn't measure"));

  input.addEventListener("input", () => {
    checkbox.checked = false;
    input.disabled = false;
    survey.weight = input.value;
    debouncedSave();
    scheduleOutputs();
  });
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      input.value = "";
      input.disabled = true;
      survey.weight = "Didn't measure";
    } else {
      input.disabled = false;
      survey.weight = input.value;
      input.focus();
    }
    debouncedSave();
    renderOutputs();
  });

  row.append(input, checkboxLabel);
  wrapper.append(labelText, row);
  fieldset.append(wrapper);
}

function labeledTextareaControl(labelText, value, onInput) {
  const label = document.createElement("label");
  label.className = "field-control";
  const span = document.createElement("span");
  span.textContent = labelText;
  const textarea = document.createElement("textarea");
  textarea.value = value || "";
  textarea.addEventListener("input", () => {
    onInput(textarea.value);
    debouncedSave();
    scheduleOutputs();
  });
  label.append(span, textarea);
  return label;
}

function appendNapControl(fieldset, survey) {
  const wrapper = document.createElement("div");
  wrapper.className = "nap-control";
  const detected = detectNapsForDate(state.currentDate);
  // Same once-per-day marker discipline as the morning sleep prefill.
  if (detected.length && !cleanNapAnswer(survey.naps) && !survey._napsCalendarAutofill) {
    survey._napsCalendarAutofill = "1";
    survey.naps = detected.map((item) => `${item.start}-${item.end}`).join("; ");
    debouncedSave();
  }
  const renderRows = () => {
    wrapper.innerHTML = "";
    const ranges = parseNapAnswer(survey.naps);
    const rows = ranges.length ? ranges : [{ start: "", end: "" }];
    rows.forEach((range, index) => {
      const row = document.createElement("div");
      row.className = "nap-row";
      const start = compactTimeEditor("Start", range.start, () => updateAnswer());
      const end = compactTimeEditor("End", range.end, () => updateAnswer());
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "quiet";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => {
        rows.splice(index, 1);
        survey.naps = rows.map((item) => `${item.start}-${item.end}`).join("; ");
        renderRows();
        debouncedSave();
        renderOutputs();
      });
      row.append(start.element, end.element, remove);
      wrapper.append(row);
      function updateAnswer() {
        rows[index] = { start: start.value(), end: end.value() };
        survey.naps = rows.map((item) => `${item.start}-${item.end}`).join("; ");
        debouncedSave();
        renderOutputs();
      }
    });
    const add = document.createElement("button");
    add.type = "button";
    add.className = "quiet add-nap-button";
    add.textContent = "Add nap";
    add.addEventListener("click", () => {
      const next = parseNapAnswer(survey.naps);
      next.push({ start: "", end: "" });
      survey.naps = next.map((item) => `${item.start}-${item.end}`).join("; ");
      renderRows();
    });
    wrapper.append(add);
    // Overlap, not exact match: a hand-adjusted nap should not keep re-listing
    // its calendar twin as missing.
    const current = parseNapAnswer(survey.naps);
    const missing = detected.filter((nap) => !current.some((row) => napRangesOverlap(row, nap)));
    if (missing.length) {
      const note = document.createElement("div");
      note.className = "survey-note nap-detected";
      note.append(document.createTextNode(
        `Calendar also shows: ${missing.map((nap) => `${formatClockFromTime(nap.start)}-${formatClockFromTime(nap.end)}`).join(", ")} `
      ));
      const addMissing = document.createElement("button");
      addMissing.type = "button";
      addMissing.className = "quiet";
      addMissing.textContent = missing.length === 1 ? "Add nap from calendar" : "Add naps from calendar";
      addMissing.addEventListener("click", () => {
        const next = parseNapAnswer(survey.naps).filter((row) => row.start || row.end);
        next.push(...missing);
        survey.naps = next.map((item) => `${item.start}-${item.end}`).join("; ");
        renderRows();
        debouncedSave();
        renderOutputs();
      });
      note.append(addMissing);
      wrapper.append(note);
    }
  };
  renderRows();
  fieldset.append(wrapper);
}

function compactTimeEditor(labelText, value, onChange) {
  const parsed = timeForDisplay(value);
  const label = document.createElement("label");
  label.className = "field-control compact-time-control";
  const span = document.createElement("span");
  span.textContent = labelText;
  const row = document.createElement("div");
  row.className = "time-row";
  const input = document.createElement("input");
  input.type = "text";
  input.inputMode = "numeric";
  input.placeholder = "h:mm";
  input.value = parsed.time;
  const select = document.createElement("select");
  select.innerHTML = `<option value="AM">AM</option><option value="PM">PM</option>`;
  select.value = parsed.meridiem;
  input.addEventListener("input", onChange);
  select.addEventListener("change", onChange);
  row.append(input, select);
  label.append(span, row);
  return {
    element: label,
    value: () => toMilitaryTime(input.value, select.value)
  };
}

function categorySelect(value, onChange) {
  const select = document.createElement("select");
  select.innerHTML = `<option value=""></option>${SCHEMA.categories.map((c) => `<option value="${c.code}">${c.code}</option>`).join("")}`;
  select.value = value;
  select.title = SCHEMA.categories.map((c) => `${c.code} = ${c.label}`).join("\n");
  select.addEventListener("change", () => onChange(select.value));
  return select;
}

function categoryLegend() {
  const legend = document.createElement("div");
  legend.className = "tag-list";
  for (const c of SCHEMA.categories) {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = `${c.code}: ${c.label}`;
    legend.append(tag);
  }
  return legend;
}

function splitAnswer(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function fieldAnswer(answer, field) {
  const parts = String(answer || "").split(";").map((part) => part.trim()).filter(Boolean);
  const match = parts.find((part) => normalize(part).startsWith(`${normalize(field)}:`));
  return match ? match.slice(match.indexOf(":") + 1).trim() : "";
}

function setFieldAnswer(answer, field, value) {
  const pairs = new Map();
  for (const part of String(answer || "").split(";")) {
    const index = part.indexOf(":");
    if (index > -1) pairs.set(part.slice(0, index).trim(), part.slice(index + 1).trim());
  }
  pairs.set(field, value);
  return Array.from(pairs, ([key, val]) => `${key}: ${val}`).join("; ");
}

function isClockTimeField(field) {
  return /^time i /i.test(field);
}

function toMilitaryTime(value, meridiem) {
  const cleaned = String(value || "").trim();
  if (!cleaned) return "";
  const match = /^(\d{1,2})(?::?(\d{2}))?$/.exec(cleaned);
  if (!match) return cleaned;
  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  if (Number.isNaN(hour) || Number.isNaN(minute) || minute > 59) return cleaned;
  if (hour < 1 || hour > 12) {
    if (hour >= 0 && hour <= 23) return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    return cleaned;
  }
  if (meridiem === "PM" && hour < 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function timeForDisplay(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value || "").trim());
  if (!match) return { time: String(value || ""), meridiem: "AM" };
  let hour = Number(match[1]);
  const minute = match[2];
  const meridiem = hour >= 12 ? "PM" : "AM";
  hour %= 12;
  if (hour === 0) hour = 12;
  return { time: `${hour}:${minute}`, meridiem };
}

function parseNapAnswer(answer) {
  return String(answer || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [start = "", end = ""] = part.split("-").map((piece) => piece.trim());
      return { start, end };
    });
}

function cleanNapAnswer(answer) {
  return parseNapAnswer(answer)
    .filter((range) => range.start || range.end)
    .map((range) => `${range.start}-${range.end}`)
    .join("; ");
}

// ---- Sleep detection from calendar ----------------------------------------
// Category-Z "actual" calendar events are the raw sleep record. The morning
// survey reads them to prefill fell-asleep / final-wake times, and the night
// survey's naps question picks up the leftover daytime blocks.
//
// Night vs nap is decided by chaining. The longest overnight block (midpoint
// between previous-day 18:00 and survey-day 12:00, at least 90 minutes long)
// is the core of the night, and a neighboring block joins the night only when
// the waking gap is short enough AND the sleep on the far side of the gap
// lasted at least as long as the gap itself. So 19:00-03:00 + awake an hour +
// 04:00-08:00 chains into one night with one wake-up (4h asleep > 1h awake),
// while waking at 08:00 and napping 09:00-09:30 stays a nap (30m asleep < 1h
// awake). Blocks that join no night are naps.

const SLEEP_MAX_WAKE_GAP_MINUTES = 180;
const SLEEP_MIN_NIGHT_CORE_MINUTES = 90;
const SLEEP_NIGHT_MIDPOINT_START = 18 * 60;
const SLEEP_NIGHT_MIDPOINT_END = 12 * 60;

function actualSleepSegments(startDate, endDate) {
  const seen = new Set();
  const segments = [];
  for (let date = startDate; date <= endDate; date = shiftISODate(date, 1)) {
    for (const event of eventsForDay(date)) {
      if (event.category !== "Z" || event.kind !== "actual" || event.allDay) continue;
      const start = calendarDateTimeToAbsoluteMinutes(calendarEventSourceStart(event));
      const end = Math.max(start + CALENDAR_SNAP_MINUTES, calendarDateTimeToAbsoluteMinutes(calendarEventSourceEnd(event)));
      const key = `${event.id}|${start}`;
      if (seen.has(key)) continue;
      seen.add(key);
      segments.push({ start, end });
    }
  }
  segments.sort((a, b) => a.start - b.start || a.end - b.end);
  const merged = [];
  for (const segment of segments) {
    const last = merged[merged.length - 1];
    if (last && segment.start <= last.end + CALENDAR_SNAP_MINUTES) last.end = Math.max(last.end, segment.end);
    else merged.push({ ...segment });
  }
  return merged;
}

function detectNightSleep(date) {
  const segments = actualSleepSegments(shiftISODate(date, -1), date);
  const dayStart = calendarDateToDayIndex(date) * 1440;
  const windowStart = dayStart - 1440 + SLEEP_NIGHT_MIDPOINT_START;
  const windowEnd = dayStart + SLEEP_NIGHT_MIDPOINT_END;
  let core = null;
  for (const segment of segments) {
    const midpoint = (segment.start + segment.end) / 2;
    if (midpoint < windowStart || midpoint >= windowEnd) continue;
    if (segment.end - segment.start < SLEEP_MIN_NIGHT_CORE_MINUTES) continue;
    if (!core || segment.end - segment.start > core.end - core.start) core = segment;
  }
  if (!core) return null;
  const chain = [core];
  const coreIndex = segments.indexOf(core);
  for (let i = coreIndex - 1; i >= 0; i--) {
    const gap = chain[0].start - segments[i].end;
    if (gap > SLEEP_MAX_WAKE_GAP_MINUTES || segments[i].end - segments[i].start < gap) break;
    chain.unshift(segments[i]);
  }
  for (let i = coreIndex + 1; i < segments.length; i++) {
    const gap = segments[i].start - chain[chain.length - 1].end;
    if (gap > SLEEP_MAX_WAKE_GAP_MINUTES || segments[i].end - segments[i].start < gap) break;
    chain.push(segments[i]);
  }
  let awakeMinutes = 0;
  for (let i = 1; i < chain.length; i++) awakeMinutes += chain[i].start - chain[i - 1].end;
  return {
    fellAsleep: chain[0].start,
    finalWake: chain[chain.length - 1].end,
    wakeUps: chain.length - 1,
    awakeMinutes,
    segments: chain
  };
}

function detectNapsForDate(date) {
  const dayStart = calendarDateToDayIndex(date) * 1440;
  const dayEnd = dayStart + 1440;
  // Exclude both the night that ended this morning and the one starting
  // tonight; a block falling asleep late this evening belongs to tomorrow's
  // morning survey, not tonight's nap list.
  const lastNight = detectNightSleep(date);
  const nextNight = detectNightSleep(shiftISODate(date, 1));
  const nightSegments = [...(lastNight?.segments || []), ...(nextNight?.segments || [])];
  return actualSleepSegments(date, date)
    .filter((segment) => !nightSegments.some((night) => segment.start < night.end && segment.end > night.start))
    .map((segment) => ({ start: Math.max(segment.start, dayStart), end: Math.min(segment.end, dayEnd) }))
    .filter((segment) => segment.end > segment.start)
    .map((segment) => ({
      start: sleepClock(segment.start),
      end: segment.end === dayEnd ? "23:59" : sleepClock(segment.end)
    }));
}

function sleepClock(absoluteMinutes) {
  const minutes = ((absoluteMinutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function sleepAwakeText(minutes) {
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
}

function napClockMinutes(clock) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(clock || "").trim());
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

function napRangesOverlap(a, b) {
  const aStart = napClockMinutes(a.start);
  const bStart = napClockMinutes(b.start);
  if (aStart == null || bStart == null) return false;
  const aEnd = napClockMinutes(a.end) ?? aStart + 1;
  const bEnd = napClockMinutes(b.end) ?? bStart + 1;
  return aStart < bEnd && aEnd > bStart;
}

function appendSleepDetectionNote(fieldset, survey) {
  const night = detectNightSleep(state.currentDate);
  if (!night) return;
  const fellClock = sleepClock(night.fellAsleep);
  const wokeClock = sleepClock(night.finalWake);
  const apply = () => {
    survey.sleep = setFieldAnswer(survey.sleep, "Time I fell asleep", fellClock);
    survey.sleep = setFieldAnswer(survey.sleep, "Time I woke up", wokeClock);
    if (night.wakeUps > 0 || !String(survey.awake || "").trim()) survey.awake = sleepAwakeText(night.awakeMinutes);
  };
  // Prefill once per day, and only into untouched fields; the marker keeps a
  // deliberately cleared answer from being refilled on the next render.
  const untouched = !fieldAnswer(survey.sleep, "Time I fell asleep") && !fieldAnswer(survey.sleep, "Time I woke up");
  if (untouched && !survey._sleepCalendarAutofill) {
    survey._sleepCalendarAutofill = "1";
    apply();
    debouncedSave();
  }
  const note = document.createElement("div");
  note.className = "survey-note sleep-detected";
  const wakeText = night.wakeUps
    ? `${night.wakeUps} mid-sleep wake-up${night.wakeUps === 1 ? "" : "s"}, ${sleepAwakeText(night.awakeMinutes)} awake`
    : "no mid-sleep wake-ups";
  note.append(document.createTextNode(
    `Calendar: fell asleep ${formatClockFromTime(fellClock)}, final wake-up ${formatClockFromTime(wokeClock)} (${wakeText}). `
  ));
  const use = document.createElement("button");
  use.type = "button";
  use.className = "quiet";
  use.textContent = "Use calendar times";
  use.addEventListener("click", () => {
    apply();
    debouncedSave();
    renderSurveyForm();
    renderOutputs();
  });
  note.append(use);
  fieldset.append(note);
}

/* --- Night survey evidence --------------------------------------------------

   The day already wrote most of the night survey down somewhere: an exercise
   block on the calendar, a networking meeting, a self-care habit ticked off as
   a task. This panel reads those records back and offers the answers, so the
   survey becomes confirming what happened rather than remembering it.

   It deliberately does NOT auto-apply, which is where it parts company with
   the sleep prefill above. That one is arithmetic on blocks whose whole purpose
   is recording sleep -- the times are the data. These are keyword guesses about
   what a title meant, and a wrong tick here does not just cost a correction:
   these same answers feed the correlation and frequency cards, so a
   manufactured "exercised" would quietly become a finding. Suggest, let the
   click confirm, and the trend data stays honest.

   Adding a rule means adding it here only. Values are filtered against the
   question's live choice list before being offered, so a choice removed from
   the survey is never silently reintroduced.
--------------------------------------------------------------------------- */

const NIGHT_EVIDENCE_RULES = [
  {
    questionId: "exercise",
    categories: ["E"],
    minMinutes: 10,
    // First match wins per block, so the specific patterns lead and the
    // fallback only catches a block none of them recognised.
    match: [
      { test: /weight|lift|gym|strength|squat|bench|barbell/i, value: "Gym" },
      { test: /\brun|jog/i, value: "Run" },
      { test: /walk|hike/i, value: "Walk" },
      { test: /stretch|mobility|yoga/i, value: "Stretching" }
    ],
    fallback: "Other exercise"
  },
  {
    questionId: "hobbies",
    categories: ["A", "R"],
    minMinutes: 15,
    match: [
      { test: /album|music|record shop|listening session/i, value: "Music listening" },
      { test: /outdoor|walk|hike|garden/i, value: "Time outdoors" },
      { test: /read/i, value: "Reading for fun" }
    ]
  }
];

// Questions whose choices are concrete enough that a completed task naming one
// is the answer. Matched on the whole choice text, so a choice "Floss" needs a
// task that says exactly that. Empty in the default survey; add the id of any
// checklist-style question you create.
const NIGHT_EVIDENCE_TASK_QUESTIONS = [];

function nightEvidenceBlockValues(blocks, rule) {
  const minutes = new Map();
  for (const block of blocks) {
    if (rule.categories && !rule.categories.includes(block.category)) continue;
    if (rule.requires && !rule.requires.test(block.title)) continue;
    let matched = "";
    for (const matcher of rule.match || []) {
      if (matcher.test.test(block.title)) {
        matched = matcher.value;
        break;
      }
    }
    if (!matched && rule.fallback) matched = rule.fallback;
    if (!matched) continue;
    minutes.set(matched, (minutes.get(matched) || 0) + block.minutes);
  }
  return [...minutes.entries()]
    .filter(([, total]) => total >= (rule.minMinutes || 0))
    .map(([value, total]) => ({ value, minutes: total }));
}

function nightEvidenceSuggestions(date) {
  const blocks = trendsDayBlocks(date).filter((block) => block.kind === "actual" && block.minutes > 0);
  const completed = state.entries[date]?.tasks?.completed || [];
  const byQuestion = new Map();
  const offer = (questionId, value, reason) => {
    if (!byQuestion.has(questionId)) byQuestion.set(questionId, new Map());
    const bucket = byQuestion.get(questionId);
    if (!bucket.has(value)) bucket.set(value, reason);
  };

  for (const rule of NIGHT_EVIDENCE_RULES) {
    for (const found of nightEvidenceBlockValues(blocks, rule)) {
      offer(rule.questionId, found.value, `${formatWorkDuration(found.minutes)} on the calendar`);
    }
  }

  for (const questionId of NIGHT_EVIDENCE_TASK_QUESTIONS) {
    const question = SCHEMA.surveys.night.find((item) => item.id === questionId);
    if (!question) continue;
    for (const choice of questionChoices(question, "night", date)) {
      const display = choiceDisplay(choice);
      const needle = normalize(display);
      const task = completed.find((item) => normalize(String(item?.text || "")).includes(needle));
      if (task) offer(questionId, display, "ticked off as a task");
    }
  }

  const suggestions = [];
  for (const [questionId, values] of byQuestion) {
    const question = visibleSurveyQuestions("night", date).find((item) => item.id === questionId);
    if (!question) continue;
    const available = new Set(questionChoices(question, "night", date).map((choice) => choiceDisplay(choice)));
    const chosen = new Set(splitAnswer(state.entries[date]?.night?.survey?.[questionId]));
    const items = [...values.entries()]
      .filter(([value]) => available.has(value) && !chosen.has(value))
      .map(([value, reason]) => ({ value, reason }));
    if (items.length) suggestions.push({ questionId, question, items });
  }
  return suggestions;
}

function applyNightEvidence(suggestion) {
  const survey = currentSession().survey;
  const merged = new Set(splitAnswer(survey[suggestion.questionId]));
  for (const item of suggestion.items) merged.add(item.value);
  survey[suggestion.questionId] = [...merged].join(", ");
  debouncedSave();
}

function appendNightEvidencePanel() {
  if (state.session !== "night") return;
  const date = state.currentDate;
  const suggestions = nightEvidenceSuggestions(date);
  if (!suggestions.length) return;
  const total = suggestions.reduce((sum, suggestion) => sum + suggestion.items.length, 0);

  const panel = document.createElement("section");
  panel.className = "night-evidence";
  const head = document.createElement("div");
  head.className = "night-evidence-head";
  const title = document.createElement("strong");
  title.textContent = `Today's calendar and tasks answer ${total} of these`;
  const applyAll = document.createElement("button");
  applyAll.type = "button";
  applyAll.className = "quiet";
  applyAll.textContent = "Apply all";
  applyAll.addEventListener("click", () => {
    for (const suggestion of suggestions) applyNightEvidence(suggestion);
    renderSurveyForm();
    renderOutputs();
  });
  head.append(title, applyAll);
  panel.append(head);

  for (const suggestion of suggestions) {
    const row = document.createElement("div");
    row.className = "night-evidence-row";
    const label = document.createElement("span");
    label.className = "night-evidence-question";
    label.textContent = surveyDisplayLabel(suggestion.question);
    const values = document.createElement("span");
    values.className = "night-evidence-values";
    for (const item of suggestion.items) {
      const chip = document.createElement("span");
      chip.className = "night-evidence-chip";
      chip.textContent = item.value;
      chip.title = `Because: ${item.reason}`;
      values.append(chip);
    }
    const apply = document.createElement("button");
    apply.type = "button";
    apply.className = "quiet";
    apply.textContent = "Add";
    apply.addEventListener("click", () => {
      applyNightEvidence(suggestion);
      renderSurveyForm();
      renderOutputs();
    });
    row.append(label, values, apply);
    panel.append(row);
  }

  const note = document.createElement("p");
  note.className = "night-evidence-note";
  note.textContent = "Read off calendar blocks and completed tasks. Nothing is ticked until you say so.";
  panel.append(note);
  els.formView.append(panel);
}

function morningIntentionText() {
  const entry = currentEntry();
  return entry.morning.survey?.["intention-1"] || extractTextAnswer(
    SCHEMA.surveys.morning.find((question) => question.id === "intention-1"),
    entry.morning.text || "",
    normalize(entry.morning.text || "")
  );
}

function processCurrentEntry() {
  const entry = currentEntry();
  syncDocumentText();
  const text = entry.journal || "";
  const parsed = extractHours(text, state.currentDate);
  entry.hours.reality = mergeHours(entry.hours.reality, parsed.plain);
  entry.hours.categories = mergeHours(entry.hours.categories, parsed.categories);
  entry.processedAt = new Date().toISOString();
}

function mergeHours(existing, extracted) {
  return existing.map((value, index) => extracted[index] || value || "");
}

function extractSurvey(sessionName, text, dateString) {
  const normalized = normalize(text);
  const result = {};
  for (const q of SCHEMA.surveys[sessionName]) {
    if (q.id === "datem" || q.id === "daten") {
      result[q.id] = yyyymmdd(dateString);
    } else if (q.type === "multi") {
      result[q.id] = detectChoices(q.choices || [], normalized).join(", ");
    } else if (q.type === "single") {
      result[q.id] = detectChoices(q.choices || [], normalized)[0] || "";
    } else if (q.type === "slider") {
      result[q.id] = (q.fields || []).map((field) => `${field}: ${nearNumber(normalized, field) || ""}`).join("; ");
    } else if (q.type === "form") {
      result[q.id] = extractForm(q, text, normalized);
    } else {
      result[q.id] = extractTextAnswer(q, text, normalized);
    }
  }
  return result;
}

function normalize(value) {
  return value.toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/[\u2013\u2014]/g, "-");
}

function detectChoices(choices, normalizedText) {
  const found = [];
  for (const choice of choices) {
    const cleaned = normalize(choice)
      .replace(/^\d+\s+/, "")
      .replace(/\([^)]*\)/g, "")
      .replace(/[^a-z0-9+/' -]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const tokens = cleaned.split(" ").filter((token) => token.length > 2);
    const candidates = [cleaned, ...tokens];
    if (candidates.some((candidate) => candidate && normalizedText.includes(candidate))) {
      found.push(choice);
    }
  }
  return [...new Set(found)];
}

function nearNumber(normalizedText, field) {
  const anchors = normalize(field)
    .replace(/\?/g, "")
    .split(/[^a-z]+/)
    .filter((word) => word.length > 3);
  for (const anchor of anchors) {
    const after = new RegExp(`${escapeRegExp(anchor)}[^0-9]{0,35}([0-5](?:\\.\\d)?)`).exec(normalizedText);
    if (after) return after[1];
    const before = new RegExp(`([0-5](?:\\.\\d)?)[^a-z0-9]{0,35}${escapeRegExp(anchor)}`).exec(normalizedText);
    if (before) return before[1];
  }
  return "";
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractForm(question, text, normalizedText) {
  if (question.id === "sleep") {
    const fell = matchAfter(normalizedText, ["fell asleep", "went to sleep", "asleep at"]);
    const woke = matchAfter(normalizedText, ["woke up", "wake up"]);
    const location = matchAfter(normalizedText, ["location", "city"]);
    const out = matchAfter(normalizedText, ["out of bed", "got up"]);
    return `Time I fell asleep: ${fell}; Time I woke up: ${woke}; Location: ${location}; Time I got out of bed: ${out}`;
  }
  if (question.id === "flowers") {
    return ["rose", "thorn", "bud", "other"].map((key) => `${key}: ${lineValue(text, key)}`).join("; ");
  }
  return (question.fields || []).map((field) => `${field}: ${lineValue(text, field)}`).join("; ");
}

function extractTextAnswer(question, text, normalizedText) {
  const labelValue = lineValue(text, question.label);
  if (labelValue) return labelValue;
  if (question.id === "dreams") return taggedLines(text, ["dream", "song"]);
  if (question.id === "awake") return matchAfter(normalizedText, ["awake for", "awake between"]);
  if (question.id === "naps") return matchAfter(normalizedText, ["nap", "naps"]);
  if (question.id === "weight") return matchAfter(normalizedText, ["weight"]);
  if (question.id === "drinks") return matchAfter(normalizedText, ["drink", "alcohol"]);
  if (question.id === "intention-1") return sentenceAround(text, ["today i want", "intention for today", "daily intention"]);
  if (question.id === "intention-2") return sentenceAround(text, ["broader intention", "i want"]);
  return "";
}

function lineValue(text, label) {
  const pattern = new RegExp(`^\\s*${escapeRegExp(label)}\\s*:?\\s*(.+)$`, "im");
  const match = pattern.exec(text);
  return match ? match[1].trim() : "";
}

function taggedLines(text, tags) {
  return text
    .split(/\n+/)
    .filter((line) => tags.some((tag) => normalize(line).startsWith(`${tag}:`)))
    .join("; ");
}

function matchAfter(normalizedText, anchors) {
  for (const anchor of anchors) {
    const match = new RegExp(`${escapeRegExp(anchor)}[^a-z0-9]{0,8}([^.;\\n]{1,60})`).exec(normalizedText);
    if (match) return match[1].trim();
  }
  return "";
}

function sentenceAround(text, anchors) {
  const sentences = text.split(/(?<=[.!?])\s+|\n+/);
  return sentences.find((sentence) => anchors.some((anchor) => normalize(sentence).includes(anchor))) || "";
}

/* --- The divider, and why the hour grid needs one ----------------------------

   A travel day breaks the one assumption this parser was built on: that the
   clock only ever goes forwards. Fly Taipei to Bangkok and the day has two 12:30s
   in it, and nothing in the text distinguishes them -- "12:30-13:30 lunch"
   written on either side of the flight reads identically.

   Worse, the crossed-noon heuristic below actively mangles it. That rule exists
   because people write "8-9 breakfast ... 7-8 dinner" and mean 19:00 for the
   second one; it fires whenever a clock jumps backwards by more than two hours.
   The second morning after a westward flight looks exactly like that, so 8 AM in
   Bangkok would be filed as 8 PM, silently, in a day that is already odd.

   The fix is a line in the document, written by the app when it notices the day
   spans a move. It is a segment break: the hour grid draws one 24-hour strip per
   side and the heuristic starts over, so both mornings can be 8 AM. The line is
   ordinary text -- it survives an export, a sync, and being edited by hand, and
   deleting it merges the day back into one strip, which is a legitimate thing to
   want if the flight was short enough not to matter. */

const ZONE_DIVIDER_PATTERN = /^[\s—–-]*time zone changed:\s*(.+?)\s*(?:→|->)\s*(.+?)\s*,\s*(\d{1,2}:\d{2})(?:\s*(?:becomes|→|->)\s*(\d{1,2}:\d{2}))?\s*[\s—–-]*$/i;

// "13:20 becomes 12:20" rather than one clock, because the two clocks either
// side of the line are the whole point: the lines above it were written on the
// first, the lines below it on the second.
function zoneDividerLine(from, to, leftClock, arrivedClock) {
  const clocks = arrivedClock && arrivedClock !== leftClock ? `${leftClock} becomes ${arrivedClock}` : leftClock;
  return `— time zone changed: ${zoneCityLabel(from)} → ${zoneCityLabel(to)}, ${clocks} —`;
}

function parseZoneDivider(line) {
  const match = ZONE_DIVIDER_PATTERN.exec(String(line || "").trim());
  if (!match) return null;
  return { from: match[1].trim(), to: match[2].trim(), clock: (match[4] || match[3]).trim() };
}

/* Written into the day's document the first time the app sees that a move
   happened inside it. Idempotent by counting: a day with two moves and one
   divider gets the second one, a day already marked up is left alone, and a
   divider deleted by hand comes back next time the day is opened -- which is
   the right trade, since the alternative is a silently mis-parsed day.

   Nothing else in the app writes to the document, so this deliberately follows
   the quick-journal convention of updating both the HTML and its plain mirror. */
function ensureZoneDividersForDate(date) {
  if (!zoneTransitionsLoaded) return false;
  const rows = zoneTransitionsOnDate(date);
  if (!rows.length) return false;
  const entry = state.entries?.[date];
  if (!entry) return false;
  if (typeof entry.journal !== "string") entry.journal = "";
  if (typeof entry.journalHtml !== "string") entry.journalHtml = "";
  const already = entry.journal.split(/\n/).filter((line) => parseZoneDivider(line)).length;
  if (already >= rows.length) return false;
  for (const row of rows.slice(already)) {
    const instant = Date.parse(row.atInstant);
    const line = zoneDividerLine(
      row.from,
      row.to,
      instantToZoneWallClock(instant, row.from).slice(11, 16),
      instantToZoneWallClock(instant, row.to).slice(11, 16)
    );
    const safe = line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    entry.journal = entry.journal ? `${entry.journal}\n${line}` : line;
    entry.journalHtml = entry.journalHtml ? `${entry.journalHtml}<p>${safe}</p>` : `<p>${safe}</p>`;
  }
  saveEntryToDisk(entry);
  return true;
}

function extractHours(text, date = "") {
  const plain = Array(24).fill("");
  const categories = Array(24).fill("");
  // The zones the log says this date was worn by, used to label the strips.
  // The divider's own words are the fallback, for a day typed by hand or one
  // whose transition was recorded somewhere the log never saw.
  const dayZones = date && typeof dateZoneSegments === "function" ? dateZoneSegments(date).map((segment) => segment.zone) : [];
  const segments = [];
  let current = null;
  let lastMinute = null;
  const openSegment = (label, clock) => {
    current = {
      zone: dayZones[segments.length] || "",
      label: label || zoneCityLabel(dayZones[segments.length] || ""),
      fromClock: clock || "00:00",
      plain: Array(24).fill(""),
      categories: Array(24).fill("")
    };
    segments.push(current);
    // The whole point of the break: the clock is allowed to go backwards here.
    lastMinute = null;
  };
  openSegment("", "00:00");
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  for (const line of lines) {
    const divider = parseZoneDivider(line);
    if (divider) {
      openSegment(divider.to, divider.clock);
      continue;
    }
    const ranges = parseTimeRanges(line);
    if (!ranges.length) continue;
    const activity = cleanActivity(line);
    const category = categorize(activity);
    for (const range of ranges) {
      let start = range.start;
      let end = range.end;
      if (lastMinute !== null && start < lastMinute - 120 && start + 720 < 1440) {
        start += 720;
        end += 720;
      }
      lastMinute = Math.max(lastMinute || 0, end);
      const startHour = Math.max(0, Math.floor(start / 60));
      const endHour = Math.min(24, Math.max(startHour + 1, Math.ceil(end / 60)));
      for (let hour = startHour; hour < endHour; hour += 1) {
        plain[hour] = appendUnique(plain[hour], activity);
        categories[hour] = category || categories[hour];
        current.plain[hour] = appendUnique(current.plain[hour], activity);
        current.categories[hour] = category || current.categories[hour];
      }
    }
  }
  // plain/categories stay the merged view of the day, which is what every
  // existing caller wants and what a 24-slot entry file can hold. The segments
  // ride alongside for the one screen that can draw them.
  return { plain, categories, segments };
}

function parseTimeRanges(line) {
  const normalized = line.toLowerCase().replace(/[\u2013\u2014]/g, "-");
  const ranges = [];
  const rangeRegex = /(?:(?:from|at)\s*)?(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?\s*(?:-|to|until)\s*(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?/gi;
  let match;
  while ((match = rangeRegex.exec(normalized))) {
    const start = toMinutes(match[1], match[2], match[3], null);
    const end = toMinutes(match[4], match[5], match[6], start);
    if (Number.isFinite(start) && Number.isFinite(end)) ranges.push({ start, end: end <= start ? end + 720 : end });
  }
  if (ranges.length) return ranges;
  const pointRegex = /\b(?:at\s*)?(\d{1,2})(?::(\d{2}))\s*(a\.?m\.?|p\.?m\.?)?\b/i;
  const point = pointRegex.exec(normalized);
  if (point) {
    const start = toMinutes(point[1], point[2], point[3], null);
    if (Number.isFinite(start)) ranges.push({ start, end: Math.min(1440, start + 60) });
  }
  return ranges;
}

function toMinutes(hourText, minuteText, meridiem, previousStart) {
  let hour = Number(hourText);
  const minutes = Number(minuteText || 0);
  if (Number.isNaN(hour) || Number.isNaN(minutes)) return NaN;
  const m = meridiem ? meridiem.replace(/\./g, "") : "";
  if (m.startsWith("p") && hour < 12) hour += 12;
  if (m.startsWith("a") && hour === 12) hour = 0;
  if (!m && previousStart !== null && hour < 12 && previousStart >= 12 * 60) hour += 12;
  return hour * 60 + minutes;
}

function cleanActivity(line) {
  return line
    .replace(/(?:(?:from|at)\s*)?\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?)?\s*(?:-|to|until)\s*\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?)?/gi, "")
    .replace(/\b(?:at\s*)?\d{1,2}:\d{2}\s*(?:a\.?m\.?|p\.?m\.?)?/gi, "")
    .replace(/^[,;:\s-]+/, "")
    .trim();
}

function appendUnique(existing, addition) {
  if (!addition) return existing;
  if (!existing) return addition;
  return existing.includes(addition) ? existing : `${existing}; ${addition}`;
}

function categorize(activity) {
  const text = normalize(activity);
  for (const category of SCHEMA.categories) {
    if (category.keywords.some((keyword) => text.includes(keyword))) return category.code;
  }
  return "";
}

/* The output panel is a read-only preview of the answers, and rebuilding it
   costs real time -- the week digest alone walks the calendar for seven days.
   A control that fires once per click can afford renderOutputs() directly, but
   one that fires per keystroke or per pixel of slider drag cannot: the panel
   was being rebuilt between characters, which is what made typing arrive in
   blocks. Those callers use scheduleOutputs() and the panel catches up once the
   hand stops. Anything that renders immediately cancels the pending pass so the
   two can never fight over the same panel. */
let outputsRenderTimer = null;

function scheduleOutputs() {
  clearTimeout(outputsRenderTimer);
  outputsRenderTimer = setTimeout(renderOutputs, 200);
}

function renderOutputs() {
  clearTimeout(outputsRenderTimer);
  outputsRenderTimer = null;
  renderSurveyOutput();
  renderHoursOutput();
  renderJournalOutput();
  renderCompletedOutput();
  renderMistakesOutput();
  renderMissingOutput();
  renderWeekOutput();
}

function renderSurveyOutput() {
  const survey = currentSession().survey || {};
  els.surveyOutput.innerHTML = "";
  const group = document.createElement("div");
  group.className = "output-group";
  const questions = visibleSurveyQuestions(state.session);
  for (const q of questions) {
    const row = document.createElement("div");
    row.className = "answer-row";
    const label = document.createElement("label");
    label.textContent = q.label;
    const input = document.createElement("textarea");
    input.value = q.type === "textImage"
      ? normalizeTextImageAnswer(survey[q.id]).text
      : surveyValue(q, survey, state.currentDate);
    input.addEventListener("input", () => {
      if (q.type === "textImage") currentSession().survey[q.id] = { ...normalizeTextImageAnswer(currentSession().survey[q.id]), text: input.value };
      else currentSession().survey[q.id] = input.value;
      debouncedSave();
    });
    row.append(label, input);
    group.append(row);
  }
  els.surveyOutput.append(group);
}

/* Which zones wore each hour of the clock face on a travel day: none for an hour
   that never happened, two for one that came round twice. The grid itself stays
   24 editable rows -- one entry file per date is a deliberate choice, and
   forking it for a twice-a-year event would change the survey export, the search
   index and every date-keyed structure in the app for the sake of one day. What
   the rows get instead is the truth written on them. */
function zoneHourCoverage(date) {
  const segments = dateZoneSegments(date);
  if (segments.length < 2) return null;
  return Array.from({ length: 24 }, (_, hour) => {
    const from = hour * 60;
    const to = from + 60;
    const covering = segments.filter((segment) => segment.startMinutes < to && segment.endMinutes > from);
    return { count: covering.length, zones: [...new Set(covering.map((segment) => segment.zone))] };
  });
}

function renderHoursOutput() {
  const entry = currentEntry();
  els.hoursOutput.innerHTML = "";
  const group = document.createElement("div");
  group.className = "output-group";
  const title = document.createElement("h3");
  title.textContent = "Hour Log Draft";
  group.append(title);
  const coverage = zoneHourCoverage(entry.date);
  if (coverage) {
    const banner = document.createElement("p");
    banner.className = "hour-zone-banner";
    const doubled = coverage.filter((hour) => hour.count > 1).length;
    const missing = coverage.filter((hour) => hour.count === 0).length;
    banner.textContent = [
      zoneDaySummaryText(entry.date),
      doubled ? `${doubled} hour${doubled === 1 ? "" : "s"} came round twice.` : "",
      missing ? `${missing} hour${missing === 1 ? "" : "s"} never happened.` : ""
    ]
      .filter(Boolean)
      .join(" ");
    group.append(banner);
  }
  for (let hour = 0; hour < 24; hour += 1) {
    const row = document.createElement("div");
    row.className = "hour-row";
    const label = document.createElement("label");
    label.textContent = hourLabel(hour);
    const cover = coverage?.[hour];
    if (cover) {
      row.classList.toggle("is-zone-skipped", cover.count === 0);
      row.classList.toggle("is-zone-doubled", cover.count > 1);
      const mark = document.createElement("span");
      mark.className = "hour-zone-mark";
      mark.textContent = cover.count === 0 ? "—" : cover.count > 1 ? "×2" : "";
      mark.title =
        cover.count === 0
          ? "This hour never happened — the clock jumped past it."
          : cover.count > 1
            ? `Lived twice: ${cover.zones.map(zoneCityLabel).join(", then ")}.`
            : zoneCityLabel(cover.zones[0] || "");
      if (mark.textContent) label.append(mark);
    }
    const text = document.createElement("textarea");
    text.value = state.session === "morning" ? entry.hours.plan[hour] || "" : entry.hours.reality[hour] || "";
    text.addEventListener("input", () => {
      const key = state.session === "morning" ? "plan" : "reality";
      entry.hours[key][hour] = text.value;
      if (!entry.hours.categories[hour]) entry.hours.categories[hour] = categorize(text.value);
      debouncedSave();
    });
    const select = categorySelect(entry.hours.categories[hour] || "", (value) => {
      entry.hours.categories[hour] = value;
      debouncedSave();
    });
    row.append(label, text, select);
    group.append(row);
  }
  group.append(categoryLegend());
  els.hoursOutput.append(group);
}

/* Read-only on purpose. This used to be a second plain-text box bound to
   entry.journal; with formatting in the Document view, editing here would either
   throw away the markup or be silently overwritten by the rich editor's mirror.

   It is also the app's reading surface: scrolling past the bottom of the shown
   day appends the previous day with a date divider, so the tab reads backwards
   through the archive like a book, and the ‹ › arrows move the reading date
   without touching the app's selected date (changing that would reload the
   editor and the surveys under the reader). Empty days are stepped over.

   Rebuild rules: the container is replaced on every renderOutputs() (every
   350 ms save while typing), so the rebuild is skipped when nothing it shows
   has changed, and scrollTop is carried across when it has — otherwise the
   reader would snap to the top mid-read on each keystroke. */

let journalReaderStart = null;
let journalReaderExtraDates = [];
let journalReaderAnchor = null;
let journalReaderSignature = "";
const JOURNAL_READER_LOOKBACK_DAYS = 120;

function journalEntryHasText(date) {
  const entry = state.entries[date];
  return Boolean(entry && String(entry.journal || "").trim());
}

// The next non-empty date strictly before `date`, or null within the lookback.
function previousJournalDate(date) {
  let cursor = date;
  for (let step = 0; step < JOURNAL_READER_LOOKBACK_DAYS; step += 1) {
    cursor = shiftISODate(cursor, -1);
    if (journalEntryHasText(cursor)) return cursor;
  }
  return null;
}

function journalReaderDivider(date) {
  const divider = document.createElement("div");
  divider.className = "journal-reader-divider";
  const label = new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  divider.textContent = label;
  divider.title = "Open this day";
  divider.addEventListener("click", () => {
    syncDocumentText();
    state.currentDate = date;
    ensureEntry(date);
    saveLocal();
    setView("document");
  });
  return divider;
}

function journalReaderDayBlock(date) {
  const wrap = document.createElement("div");
  wrap.className = "journal-reader-day";
  wrap.append(journalReaderDivider(date));
  const preview = document.createElement("div");
  preview.className = "doc-preview";
  preview.innerHTML = sanitizeDocHtml(entryDocHtml(state.entries[date] || {}));
  wrap.append(preview);
  return wrap;
}

function appendNextJournalReaderDay() {
  const last = journalReaderExtraDates.length
    ? journalReaderExtraDates[journalReaderExtraDates.length - 1]
    : journalReaderStart;
  const next = previousJournalDate(last);
  if (!next) return false;
  journalReaderExtraDates.push(next);
  els.journalOutput.append(journalReaderDayBlock(next));
  journalReaderSignature = "";
  return true;
}

function handleJournalReaderScroll() {
  const panel = els.journalOutput;
  if (!panel || panel.classList.contains("hidden")) return;
  if (panel.scrollTop + panel.clientHeight < panel.scrollHeight - 220) return;
  appendNextJournalReaderDay();
}

function shiftJournalReaderStart(delta) {
  const next = shiftISODate(journalReaderStart, delta);
  if (delta > 0 && next > todayISO()) return;
  journalReaderStart = next;
  journalReaderExtraDates = [];
  journalReaderSignature = "";
  renderJournalOutput();
}

function renderJournalOutput() {
  const panel = els.journalOutput;
  if (!panel) return;
  // A date change in the app resets the reader to it; otherwise the reader
  // keeps its own place.
  if (journalReaderAnchor !== state.currentDate) {
    journalReaderAnchor = state.currentDate;
    journalReaderStart = state.currentDate;
    journalReaderExtraDates = [];
  }
  if (!journalReaderStart) journalReaderStart = state.currentDate;

  const startEntry = state.entries[journalReaderStart] || {};
  const signature = [
    journalReaderStart,
    journalReaderExtraDates.join(","),
    String(startEntry.journalHtml || startEntry.journal || "").length
  ].join("|");
  if (signature === journalReaderSignature && panel.childNodes.length) return;
  journalReaderSignature = signature;

  const scrollTop = panel.scrollTop;
  panel.innerHTML = "";

  const controls = document.createElement("div");
  controls.className = "journal-reader-controls";
  const back = document.createElement("button");
  back.type = "button";
  back.className = "quiet";
  back.textContent = "‹";
  back.title = "Read an earlier day";
  back.addEventListener("click", () => shiftJournalReaderStart(-1));
  const forward = document.createElement("button");
  forward.type = "button";
  forward.className = "quiet";
  forward.textContent = "›";
  forward.title = "Read a later day";
  forward.addEventListener("click", () => shiftJournalReaderStart(1));
  const note = document.createElement("span");
  note.className = "journal-reader-note";
  note.textContent =
    journalReaderStart === state.currentDate
      ? "Keep scrolling to read into earlier days"
      : `Reading from ${formatShortDate(journalReaderStart)}`;
  controls.append(back, forward, note);
  if (journalReaderStart !== state.currentDate) {
    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "quiet";
    reset.textContent = "⟲";
    reset.title = "Back to the selected day";
    reset.addEventListener("click", () => {
      journalReaderStart = state.currentDate;
      journalReaderExtraDates = [];
      journalReaderSignature = "";
      renderJournalOutput();
    });
    controls.append(reset);
  }
  panel.append(controls);

  if (journalEntryHasText(journalReaderStart) || journalReaderStart === state.currentDate) {
    if (journalEntryHasText(journalReaderStart)) {
      panel.append(journalReaderDayBlock(journalReaderStart));
    } else {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "No journal text yet.";
      panel.append(empty);
    }
  }
  for (const date of journalReaderExtraDates) {
    if (journalEntryHasText(date)) panel.append(journalReaderDayBlock(date));
  }
  panel.scrollTop = scrollTop;
}

function renderCompletedOutput() {
  const tasks = currentEntry().tasks;
  ensureTaskState(currentEntry());
  els.completedOutput.innerHTML = "";
  if (!tasks.completed.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No tasks completed today yet.";
    els.completedOutput.append(empty);
    return;
  }
  const group = document.createElement("div");
  group.className = "completed-task-list";
  const undoButton = document.createElement("button");
  undoButton.type = "button";
  undoButton.className = "quiet";
  undoButton.textContent = "Undo last completed";
  undoButton.addEventListener("click", undoLastCompletedTask);
  group.append(undoButton);
  for (const task of [...tasks.completed].reverse()) {
    const row = document.createElement("div");
    row.className = "completed-task-row";
    const text = document.createElement("strong");
    text.textContent = task.text || "";
    const meta = document.createElement("span");
    const completedAt = task.completedAt ? formatClockTime(new Date(task.completedAt)) : "";
    meta.textContent = completedAt ? `Completed ${completedAt}` : "Completed today";
    row.append(text, meta);
    group.append(row);
  }
  els.completedOutput.append(group);
}

// The capture half of the mistakes log. This panel stays reachable from every
// view, so a mistake can be logged without leaving whatever caused it.
function renderMistakesOutput() {
  const entry = currentEntry();
  ensureMistakeState(entry);
  els.mistakesOutput.innerHTML = "";

  const quickAdd = document.createElement("form");
  quickAdd.className = "mistake-capture";
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "What I did (Enter logs it, judge it later)";
  quickAdd.append(input, ...mistakeOutcomeButtons(() => {
    const text = input.value;
    input.value = "";
    return text;
  }, () => els.mistakesOutput.querySelector(".mistake-capture input")?.focus()));
  quickAdd.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value;
    input.value = "";
    addMistake(text);
    els.mistakesOutput.querySelector(".mistake-capture input")?.focus();
  });
  els.mistakesOutput.append(quickAdd);

  if (state.currentDate !== todayISO()) {
    const note = document.createElement("div");
    note.className = "mistake-capture-note";
    note.textContent = `Logging to ${formatDateLine(state.currentDate)}`;
    els.mistakesOutput.append(note);
  }

  if (!entry.mistakes.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Nothing logged yet.";
    els.mistakesOutput.append(empty);
    return;
  }

  const unfinished = unfinishedMistakeCount(entry);
  const summary = document.createElement("button");
  summary.type = "button";
  summary.className = "quiet mistake-capture-summary";
  summary.textContent = unfinished ? `${unfinished} to finish — open the log` : "All rows filled in — open the log";
  summary.addEventListener("click", () => setView("mistakes"));
  els.mistakesOutput.append(summary);

  const list = document.createElement("div");
  list.className = "mistake-capture-list";
  for (const mistake of [...entry.mistakes].reverse()) {
    const row = document.createElement("div");
    row.className = mistakeIsComplete(mistake) ? "mistake-capture-row" : "mistake-capture-row is-unfinished";
    row.dataset.outcome = mistake.outcome || "";
    const text = document.createElement("strong");
    text.textContent = mistake.what || "";
    const meta = document.createElement("span");
    const outcome = mistakeOutcomeLabel(mistake.outcome);
    const parts = [mistake.time, outcome, mistakeIsComplete(mistake) ? "" : "needs finishing"].filter(Boolean);
    meta.textContent = parts.join(" · ");
    row.append(text, meta);
    list.append(row);
  }
  els.mistakesOutput.append(list);
}

function renderMissingOutput() {
  const entry = currentEntry();
  els.missingOutput.innerHTML = "";
  const sections = [
    { title: "Daily Document", items: missingDailyItems(entry) },
    { title: "Morning Survey", items: missingSurveyItems("morning", entry.morning.survey, entry.date) },
    { title: "Night Survey", items: missingSurveyItems("night", entry.night.survey, entry.date) },
    { title: "Lessons from Experience", items: missingMistakeItems(entry) },
    { title: "Hour Log", items: missingHourItems(entry) }
  ];
  let total = 0;
  for (const section of sections) {
    total += section.items.length;
    const group = document.createElement("div");
    group.className = "missing-group";
    const title = document.createElement("h3");
    title.textContent = `${section.title} (${section.items.length})`;
    group.append(title);
    if (!section.items.length) {
      const done = document.createElement("div");
      done.className = "missing-ok";
      done.textContent = "Nothing obvious missing.";
      group.append(done);
    } else {
      const list = document.createElement("ul");
      for (const item of section.items) {
        const li = document.createElement("li");
        li.textContent = item;
        list.append(li);
      }
      group.append(list);
    }
    els.missingOutput.append(group);
  }
  const summary = document.createElement("div");
  summary.className = total ? "missing-summary warn" : "missing-summary";
  summary.textContent = total ? `${total} things look incomplete.` : "All obvious sections have something in them.";
  els.missingOutput.prepend(summary);
}

function missingDailyItems(entry) {
  const items = [];
  if (!String(entry.journal || "").trim()) items.push("Daily document is empty.");
  return items;
}

function missingSurveyItems(sessionName, survey, dateString) {
  const items = [];
  for (const question of visibleSurveyQuestions(sessionName, dateString)) {
    if (question.optional) continue;
    if (question.type === "textImage") {
      const answer = normalizeTextImageAnswer(survey?.[question.id]);
      const missing = [!answer.text.trim() ? "answer" : "", !answer.image?.url ? "picture" : ""].filter(Boolean);
      if (missing.length) items.push(`${question.label} (missing ${missing.join(" and ")})`);
      continue;
    }
    const value = surveyValue(question, survey, dateString);
    if (!String(value || "").trim()) items.push(question.label.replace(/\s+/g, " ").trim());
  }
  return items;
}

// Only rows already captured are chased here. An empty log is not "missing" —
// a day without lessons logged is a legitimate day.
function missingMistakeItems(entry) {
  const items = [];
  for (const mistake of entry.mistakes || []) {
    const blanks = MISTAKE_COLUMNS.filter((column) => !String(mistake[column.key] || "").trim()).map((column) => column.label);
    if (!mistake.outcome) blanks.unshift("Went well or badly");
    if (blanks.length) items.push(`${mistake.what || "Untitled row"} — missing ${blanks.join(", ").toLowerCase()}`);
  }
  return items;
}

function missingHourItems(entry) {
  const items = [];
  const planned = (entry.hours?.plan || []).filter((value) => String(value || "").trim()).length;
  const logged = (entry.hours?.reality || []).filter((value) => String(value || "").trim()).length;
  if (planned < 24) items.push(`${24 - planned} planning hours are empty.`);
  if (logged < 24) items.push(`${24 - logged} reality hours are empty.`);
  return items;
}

/* --- Weekly digest ----------------------------------------------------------

   The Monday-to-Sunday week containing the selected date, assembled from
   records that already exist. Nothing here is captured for the digest's sake:
   hours come from the calendar, adherence from the goal log, the highlights
   from rose/thorn answers, and the rest from the surveys.

   It lives in the output panel rather than Trends because it is a document to
   be read once and copied out, not a chart to be scrubbed. Trends answers "what
   is the shape of the last 90 days"; this answers "what happened last week".
--------------------------------------------------------------------------- */

function weekDigest(dateString) {
  const dates = workWeekDates(dateString);
  const categories = new Map();
  let loggedMinutes = 0;
  for (const date of dates) {
    for (const block of trendsDayBlocks(date)) {
      if (block.kind !== "actual" || block.minutes <= 0) continue;
      loggedMinutes += block.minutes;
      if (!block.category) continue;
      categories.set(block.category, (categories.get(block.category) || 0) + block.minutes);
    }
  }

  const rows = dates
    .filter((date) => state.entries[date])
    .map((date) => ({ date, entry: state.entries[date] }));
  const sliderAverage = (session, questionId, field) => {
    const values = rows
      .map(({ entry }) => parseTrendsNumber(parseTrendsFields(entry?.[session]?.survey?.[questionId])[field]))
      .filter((value) => value != null);
    return values.length ? values.reduce((total, value) => total + value, 0) / values.length : null;
  };
  const sleepHours = rows
    .map(({ entry }) => {
      const fields = parseTrendsFields(entry?.morning?.survey?.sleep);
      const asleep = parseTrendsClock(fields["Time I fell asleep"]);
      const woke = parseTrendsClock(fields["Time I woke up"]);
      if (asleep == null || woke == null) return null;
      let minutes = woke - asleep;
      if (minutes <= 0) minutes += 24 * 60;
      return minutes > 20 * 60 ? null : minutes / 60;
    })
    .filter((value) => value != null);

  const weights = rows
    .map(({ entry }) => parseTrendsNumber(trendsAnswerText(entry?.morning?.survey?.weight)))
    .filter((value) => value != null && value >= 60 && value <= 500);

  const highlights = [];
  for (const { date, entry } of rows) {
    const flowers = parseTrendsFields(entry?.night?.survey?.flowers);
    const rose = flowers["What's a good thing that happened today?"];
    const thorn = flowers["What's a bad thing that happened today?"];
    if (rose || thorn) highlights.push({ date, rose: rose || "", thorn: thorn || "" });
  }

  const goals = new Map();
  for (const event of goalLog || []) {
    if (!event?.goalId || !dates.includes(event.date) || trendsGoalArchived(event.goalId)) continue;
    if (event.kind === "materialize") continue;
    // One outcome per goal-day, newest wins -- the same reader contract the
    // Trends cards use, and for the same reason.
    const key = `${event.date}|${event.goalId}`;
    const found = goals.get(key);
    if (!found || String(event.ts) >= String(found.ts)) goals.set(key, event);
  }
  let done = 0;
  let missed = 0;
  const weakest = new Map();
  for (const event of goals.values()) {
    const tally = weakest.get(event.goalId) || { done: 0, total: 0 };
    if (event.kind === "unanswered") {
      weakest.set(event.goalId, tally);
      continue;
    }
    tally.total += 1;
    if (event.kind === "miss" || event.value === false) missed += 1;
    else {
      done += 1;
      tally.done += 1;
    }
    weakest.set(event.goalId, tally);
  }

  const mistakes = rows.flatMap(({ entry }) => entry.mistakes || []);
  const tagCounts = mistakeTagCounts(rows.map(({ date, entry }) => ({ date, mistakes: entry.mistakes || [] })));
  const completed = rows.reduce((total, { entry }) => total + (entry.tasks?.completed || []).length, 0);
  const words = rows.reduce((total, { entry }) => total + trendsWordCount(entry), 0);

  return {
    start: dates[0],
    end: dates[6],
    workMinutes: categories.get("W") || 0,
    loggedMinutes,
    categories: [...categories.entries()]
      .map(([code, minutes]) => ({ code, label: trendsCategoryLabel(code), minutes }))
      .sort((a, b) => b.minutes - a.minutes),
    surveyDays: rows.length,
    sleepAverage: sleepHours.length ? sleepHours.reduce((total, value) => total + value, 0) / sleepHours.length : null,
    sleepNights: sleepHours.length,
    joy: sliderAverage("night", "mental", "How much joy?"),
    gotDone: sliderAverage("night", "mental", "Did I get done what I needed to today?"),
    weightFrom: weights[0] ?? null,
    weightTo: weights[weights.length - 1] ?? null,
    goalsDone: done,
    goalsMissed: missed,
    weakestGoals: [...weakest.entries()]
      .filter(([, tally]) => tally.total > 0 && tally.done < tally.total)
      .sort((a, b) => a[1].done / a[1].total - b[1].done / b[1].total)
      .slice(0, 3)
      .map(([goalId, tally]) => `${trendsGoalTitle(goalId)} ${tally.done}/${tally.total}`),
    mistakes: mistakes.length,
    goodCalls: mistakes.filter((mistake) => mistake.outcome === "good").length,
    badCalls: mistakes.filter((mistake) => mistake.outcome === "bad").length,
    topPatterns: [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([tag, count]) => `${tag} ×${count}`),
    completed,
    words,
    highlights
  };
}

function weekDigestText(digest) {
  const lines = [`Week of ${formatShortDate(digest.start)} to ${formatShortDate(digest.end)}`, ""];
  lines.push(`Work: ${formatWorkDuration(digest.workMinutes)} logged`);
  lines.push(`Logged in total: ${formatWorkDuration(digest.loggedMinutes)} across ${digest.categories.length} categories`);
  for (const category of digest.categories.slice(0, 6)) {
    lines.push(`  ${category.label}: ${formatWorkDuration(category.minutes)}`);
  }
  lines.push("");
  lines.push(`Surveys filled: ${digest.surveyDays} of 7`);
  if (digest.sleepAverage != null) lines.push(`Sleep: ${formatHoursMinutes(digest.sleepAverage)} average over ${digest.sleepNights} nights`);
  const mood = [
    digest.joy == null ? "" : `joy ${digest.joy.toFixed(1)}`,
    digest.gotDone == null ? "" : `got things done ${digest.gotDone.toFixed(1)}`
  ].filter(Boolean).join(" · ");
  if (mood) lines.push(`Mood: ${mood}`);
  if (digest.weightTo != null) {
    const delta = digest.weightTo - digest.weightFrom;
    lines.push(`Weight: ${digest.weightTo.toFixed(1)} lbs (${delta >= 0 ? "+" : ""}${delta.toFixed(1)} over the week)`);
  }
  lines.push("");
  lines.push(`Goals: ${digest.goalsDone} done, ${digest.goalsMissed} missed`);
  for (const goal of digest.weakestGoals) lines.push(`  weakest: ${goal}`);
  lines.push(`Tasks completed: ${digest.completed}`);
  lines.push(`Lessons logged: ${digest.mistakes} (${digest.goodCalls} went well, ${digest.badCalls} went badly)${digest.topPatterns.length ? ` — ${digest.topPatterns.join(", ")}` : ""}`);
  lines.push(`Words journalled: ${digest.words}`);
  if (digest.highlights.length) {
    lines.push("");
    lines.push("Roses and thorns");
    for (const item of digest.highlights) {
      if (item.rose) lines.push(`  ${formatShortDate(item.date)} rose: ${item.rose}`);
      if (item.thorn) lines.push(`  ${formatShortDate(item.date)} thorn: ${item.thorn}`);
    }
  }
  return lines.join("\n");
}

function renderWeekOutput() {
  const digest = weekDigest(state.currentDate);
  els.weekOutput.innerHTML = "";

  const head = document.createElement("div");
  head.className = "week-digest-head";
  const title = document.createElement("h3");
  title.textContent = `${formatShortDate(digest.start)} – ${formatShortDate(digest.end)}`;
  const copy = document.createElement("button");
  copy.type = "button";
  copy.className = "quiet";
  copy.textContent = "Copy";
  copy.addEventListener("click", () => copyText(weekDigestText(digest)));
  head.append(title, copy);
  els.weekOutput.append(head);

  const stats = document.createElement("div");
  stats.className = "week-digest-stats";
  const stat = (label, value) => {
    const cell = document.createElement("div");
    cell.className = "week-digest-stat";
    const name = document.createElement("span");
    name.textContent = label;
    const amount = document.createElement("strong");
    amount.textContent = value;
    cell.append(name, amount);
    stats.append(cell);
  };
  stat("Work logged", formatWorkDuration(digest.workMinutes));
  stat("All hours logged", formatWorkDuration(digest.loggedMinutes));
  stat("Surveys", `${digest.surveyDays} / 7`);
  stat("Avg sleep", digest.sleepAverage == null ? "—" : formatHoursMinutes(digest.sleepAverage));
  stat("Avg joy", digest.joy == null ? "—" : `${digest.joy.toFixed(1)} / 5`);
  stat("Goals", `${digest.goalsDone} done · ${digest.goalsMissed} missed`);
  stat("Tasks done", String(digest.completed));
  stat("Lessons", `${digest.goodCalls} good · ${digest.badCalls} bad`);
  els.weekOutput.append(stats);

  const section = (heading, items, empty) => {
    const group = document.createElement("div");
    group.className = "week-digest-group";
    const name = document.createElement("h4");
    name.textContent = heading;
    group.append(name);
    if (!items.length) {
      const none = document.createElement("p");
      none.className = "week-digest-empty";
      none.textContent = empty;
      group.append(none);
    } else {
      const list = document.createElement("ul");
      for (const item of items) {
        const row = document.createElement("li");
        row.textContent = item;
        list.append(row);
      }
      group.append(list);
    }
    els.weekOutput.append(group);
  };

  section(
    "Where the hours went",
    digest.categories.slice(0, 8).map((category) => `${category.label} — ${formatWorkDuration(category.minutes)}`),
    "No categorised blocks logged this week."
  );
  section("Weakest goals", digest.weakestGoals, "Nothing missed, or nothing answered.");
  section("Patterns in the lessons", digest.topPatterns, "No tagged rows this week.");
  section(
    "Roses and thorns",
    digest.highlights.flatMap((item) => [
      item.rose ? `${formatShortDate(item.date)} · ${item.rose}` : "",
      item.thorn ? `${formatShortDate(item.date)} · ${item.thorn}` : ""
    ].filter(Boolean)),
    "No rose/thorn answers this week."
  );
}

function renderTabs() {
  document.querySelectorAll(".tabs button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === activeTab);
  });
  els.surveyOutput.classList.toggle("hidden", activeTab !== "survey");
  els.hoursOutput.classList.toggle("hidden", activeTab !== "hours");
  els.journalOutput.classList.toggle("hidden", activeTab !== "journal");
  els.completedOutput.classList.toggle("hidden", activeTab !== "completed");
  els.mistakesOutput.classList.toggle("hidden", activeTab !== "mistakes");
  els.missingOutput.classList.toggle("hidden", activeTab !== "missing");
  els.weekOutput.classList.toggle("hidden", activeTab !== "week");
}

function buildDocumentText() {
  const entry = currentEntry();
  return [`${formatDateLine(state.currentDate)}`, entry.journal || ""].join("\n\n");
}

function buildSurveyDraftText() {
  const session = currentSession();
  const questions = SCHEMA.surveys[state.session];
  return questions.map((q) => `${q.label}\t${surveyValue(q, session.survey, state.currentDate)}`).join("\n");
}

function buildWorkbookTSV() {
  const entry = currentEntry();
  const header = ["Date", "Row", ...HOURS];
  const categories = [yyyymmdd(entry.date), "Tracker", ...entry.hours.categories];
  const plan = [yyyymmdd(entry.date), "Intention", ...entry.hours.plan];
  const reality = [yyyymmdd(entry.date), "Reality", ...entry.hours.reality];
  return [header, categories, plan, reality].map((row) => row.map(tsvCell).join("\t")).join("\n");
}

function tsvCell(value) {
  return String(value || "").replace(/\t/g, " ").replace(/\n/g, " ");
}

function buildMarkdownExport(entry) {
  const lines = [];
  lines.push(`# ${formatDateLine(entry.date)}`);
  lines.push("");
  lines.push("## Journal");
  lines.push(journalMarkdownSection(entry));
  lines.push("");
  lines.push("## Tasks completed today");
  const completedTasks = entry.tasks?.completed || [];
  if (completedTasks.length) {
    for (const task of completedTasks) lines.push(`- ${mdCell(task.text)}`);
  } else {
    lines.push("- None");
  }
  lines.push("");
  lines.push("## Lessons from experience");
  const mistakes = entry.mistakes || [];
  if (mistakes.length) {
    lines.push(`| Time | Outcome | ${MISTAKE_COLUMNS.map((column) => column.label).join(" | ")} | Pattern |`);
    lines.push(`|---|---|${MISTAKE_COLUMNS.map(() => "---").join("|")}|---|`);
    for (const mistake of mistakes) {
      lines.push(`| ${mdCell(mistake.time)} | ${mdCell(mistakeOutcomeLabel(mistake.outcome, "label"))} | ${MISTAKE_COLUMNS.map((column) => mdCell(mistake[column.key])).join(" | ")} | ${mdCell((mistake.tags || []).join(", "))} |`);
    }
  } else {
    lines.push("- None");
  }
  lines.push("");
  lines.push("### Morning survey draft");
  for (const q of SCHEMA.surveys.morning) lines.push(`- ${q.label}: ${surveyValue(q, entry.morning.survey, entry.date)}`);
  lines.push("");
  lines.push("## Night");
  lines.push(entry.night.text || "");
  lines.push("");
  lines.push("### Night survey draft");
  for (const q of SCHEMA.surveys.night) lines.push(`- ${q.label}: ${exportSurveyValue(q, entry.night.survey, entry.date)}`);
  lines.push("");
  lines.push("## Hour log");
  lines.push("| Hour | Category | Plan | Reality |");
  lines.push("|---|---|---|---|");
  for (let hour = 0; hour < 24; hour += 1) {
    lines.push(`| ${HOURS[hour]} | ${entry.hours.categories[hour] || ""} | ${mdCell(entry.hours.plan[hour])} | ${mdCell(entry.hours.reality[hour])} |`);
  }
  return lines.join("\n");
}

/* Export-only: surveyValue also feeds editable draft inputs, and the mode and
   note must never be written back into the answer string. */
function exportSurveyValue(question, survey, dateString) {
  if (question.id !== "interaction") return surveyValue(question, survey, dateString);
  const names = splitAnswer(survey?.[question.id]);
  if (!names.length) return surveyValue(question, survey, dateString);
  const details = readInteractionDetails(survey);
  return names
    .map((name) => {
      const detail = details[name];
      const mode = detail?.mode === "call" ? "call" : detail?.mode === "in-person" ? "in person" : "";
      const note = String(detail?.note || "").trim().replace(/\s+/g, " ");
      const extra = [mode, note].filter(Boolean).join(" — ");
      return extra ? `${name} (${extra})` : name;
    })
    .join(", ");
}

function surveyValue(question, survey, dateString) {
  if (question.id === "datem" || question.id === "daten") return yyyymmdd(dateString);
  if (question.id === "naps") return cleanNapAnswer(survey?.[question.id]);
  if (question.type === "textImage") {
    const answer = normalizeTextImageAnswer(survey?.[question.id]);
    return [answer.text, answer.image?.url ? `Picture: ${answer.image.url}` : ""].filter(Boolean).join("\n");
  }
  // A descriptive block is a note to the reader, never an answer, so it must
  // not put an empty row into the export.
  if (question.type === "descriptive") return "";
  if (questionTypeStores(question.type) === "media") {
    const answer = normalizeMediaAnswer(survey?.[question.id]);
    return [
      answer.text,
      answer.image?.url ? `Picture: ${answer.image.url}` : "",
      ...answer.files.map((file) => `Attached: ${file.name} (${file.url})`)
    ]
      .filter(Boolean)
      .join("\n");
  }
  return survey?.[question.id] || "";
}

function mdCell(value) {
  return String(value || "").replace(/\|/g, "/").replace(/\n/g, " ");
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    els.saveStatus.textContent = "Copied";
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const copied = document.execCommand("copy");
    textarea.remove();
    els.saveStatus.textContent = copied ? "Copied" : "Copy failed";
  }
}

// ---------------------------------------------------------------------------
// Trends view: charts over the morning/night survey history.
// Reads across state.entries (already loaded from /api/entries) — no server
// calls. Survey answers are stored as display strings, so the parsers here
// mirror the formats the survey form writes: composite "Label: value; ..."
// strings for slider/form questions, ", "-joined choice lists for multi.
// ---------------------------------------------------------------------------

const TRENDS_RANGES = [
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
  { days: 365, label: "Year" },
  { days: 0, label: "All time" }
];
let trendsRangeDays = 90;
const TRENDS_CHART_W = 760;
const TRENDS_CHART_H = 250;
const TRENDS_PLOT = { top: 16, right: 128, bottom: 28, left: 44 };

function renderTrendsView() {
  const container = els.trendsView;
  container.innerHTML = "";
  const rows = collectTrendsRows();

  const controls = document.createElement("div");
  controls.className = "trends-controls";
  for (const range of TRENDS_RANGES) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiet trends-range-button";
    button.classList.toggle("active", trendsRangeDays === range.days);
    button.textContent = range.label;
    button.addEventListener("click", () => {
      trendsRangeDays = range.days;
      renderTrendsView();
    });
    controls.append(button);
  }
  const summary = document.createElement("span");
  summary.className = "trends-controls-summary";
  summary.textContent = `${rows.length} day${rows.length === 1 ? "" : "s"} with saved data in range`;
  controls.append(summary);
  // The monthly review's only entry point, on purpose: it is a once-a-month
  // surface and does not earn a nav slot of its own.
  const reviewButton = document.createElement("button");
  reviewButton.type = "button";
  reviewButton.className = "quiet trends-review-button";
  reviewButton.textContent = "Monthly review →";
  reviewButton.addEventListener("click", () => setView("review"));
  controls.append(reviewButton);
  container.append(controls);

  if (!rows.length) {
    const empty = document.createElement("p");
    empty.className = "trends-empty";
    empty.textContent = "No survey data in this range yet. Fill out a morning or night survey and come back.";
    container.append(empty);
    return;
  }

  container.append(buildTrendsTiles(rows));

  const grid = document.createElement("div");
  grid.className = "trends-grid";

  grid.append(
    buildTrendsLineCard({
      title: "Sleep duration",
      subtitle: "Fell-asleep to wake-up times from the morning survey",
      series: [{ label: "Hours slept", color: "var(--chart-1)", points: sleepDurationPoints(rows) }],
      yMin: 0,
      fmtValue: (v) => `${v.toFixed(1)}h`
    }),
    buildTrendsLineCard({
      title: "Sleep ratings",
      subtitle: "Morning survey sliders (1–5)",
      series: [
        { label: "Sleep quality", color: "var(--chart-1)", points: sliderPoints(rows, "morning", "quality", "Sleep quality") },
        { label: "Energy", color: "var(--chart-2)", points: sliderPoints(rows, "morning", "quality", "How energetic do you feel waking up?") }
      ],
      yMin: 0,
      yMax: 5,
      fmtValue: (v) => v.toFixed(1)
    }),
    buildTrendsLineCard({
      title: "Mood & accomplishment",
      subtitle: "Night survey sliders (1–5)",
      series: [
        { label: "Joy", color: "var(--chart-1)", points: sliderPoints(rows, "night", "mental", "How much joy?") },
        { label: "Got things done", color: "var(--chart-2)", points: sliderPoints(rows, "night", "mental", "Did I get done what I needed to today?") }
      ],
      yMin: 0,
      yMax: 5,
      fmtValue: (v) => v.toFixed(1)
    }),
    buildTrendsLineCard({
      title: "Weight",
      subtitle: "Morning survey weigh-ins (lbs)",
      series: [{ label: "Weight", color: "var(--chart-1)", points: weightPoints(rows) }],
      fmtValue: (v) => v.toFixed(1)
    })
  );

  const barCards = [
    ["Sleep disruptions", "Nights each factor was flagged", multiCounts(rows, "morning", "disruption")],
    ["Intention check", "Did the day match the morning intention?", singleCounts(rows, "night", "intentioncheck")],
    ["People", "Days interacted beyond pleasantries", multiCounts(rows, "night", "interaction")],
    ["Exercise", "Days each type was logged", multiCounts(rows, "night", "exercise")],
    ["Hobbies", "Days each hobby was logged", multiCounts(rows, "night", "hobbies")]
  ];
  for (const [title, subtitle, counts, options] of barCards) {
    grid.append(buildTrendsBarCard({ title, subtitle, ...counts, ...(options || {}) }));
  }

  // Everything above reads survey answers. These four read the exhaust the app
  // was already producing and never showed: when plans were made, when hours
  // were logged, what happened to materialised goals, and how much a day was
  // edited. No new capture -- the timestamps have been on the records all along.
  const bounds = trendsRangeBounds();
  const planLead = trendsPlanLeadCounts(bounds);
  const loggingLag = trendsLoggingLagCounts(bounds);
  const followThrough = trendsGoalFollowThrough(bounds);
  const coverage = trendsGoalCoverage(bounds);

  grid.append(
    buildTrendsBarCard({
      title: "How far ahead plans were made",
      subtitle: "Planned calendar blocks, by how long before they started they were created",
      ...planLead,
      footNote: `${planLead.total} planned block${planLead.total === 1 ? "" : "s"} in range`
    }),
    buildTrendsBarCard({
      title: "How soon hours were logged",
      subtitle: "Actual calendar blocks, by the gap between the block ending and being written down",
      ...loggingLag,
      footNote: `${loggingLag.total} logged block${loggingLag.total === 1 ? "" : "s"} in range`
    }),
    buildTrendsBarCard({
      title: "Goal follow-through",
      subtitle: "Share of answered days each goal was done. Weakest first",
      ...followThrough,
      valueSuffix: "%",
      footNote: followThrough.total
        ? `${followThrough.total} goal${followThrough.total === 1 ? "" : "s"} with a recorded answer`
        : "No goal answers in range"
    }),
    buildTrendsBarCard({
      title: "Goal coverage",
      subtitle: "Share of days a goal appeared and got any answer at all",
      ...coverage,
      valueSuffix: "%",
      footNote: coverage.total
        ? `${coverage.total} goal${coverage.total === 1 ? "" : "s"} materialised in range`
        : "No goals materialised in range"
    }),
    buildTrendsLineCard({
      title: "Entry edits",
      subtitle: "Saves per day. A spike is usually a long editing session, or the autosave loop misbehaving",
      series: [{ label: "Saves", color: "var(--chart-1)", points: trendsRevisionPoints(bounds) }],
      yMin: 0,
      fmtValue: (v) => String(Math.round(v))
    })
  );

  // Second wave. Same read-only rule, but these read the plan/actual pairing,
  // the goal log as a calendar rather than a rate, the clock the day runs on,
  // and the document itself. See the marked section further down.
  const estimatePairs = trendsEstimatePairs(bounds);
  const categoryMinutes = trendsCategoryMinutes(bounds);
  const hourEvents = trendsHourEvents(bounds);
  const plannedTotal = categoryMinutes.reduce((total, item) => total + item.plan, 0);
  const loggedTotal = categoryMinutes.reduce((total, item) => total + item.actual, 0);

  grid.append(
    buildTrendsBarCard({
      title: "Estimate accuracy",
      subtitle: "Planned blocks matched to what actually happened, by how far off the plan was",
      ...trendsEstimateBuckets(estimatePairs),
      footNote: estimatePairs.length
        ? `${estimatePairs.length} matched block${estimatePairs.length === 1 ? "" : "s"} · typical ${Math.round(trendsMedian(estimatePairs.map((pair) => pair.ratio)) * 100)}% of planned time`
        : "No planned block in range had a matching logged block"
    }),
    buildTrendsBarCard({
      title: "Time multiplier by category",
      subtitle: "Typical share of the planned time a block actually took. 100% is spot on, 200% is double",
      ...trendsEstimateByCategory(estimatePairs),
      valueSuffix: "%",
      footNote: `Categories with at least ${TRENDS_MIN_ESTIMATE_PAIRS} matched blocks. Furthest from spot-on first`
    }),
    buildTrendsPlanActualCard(
      categoryMinutes,
      `${formatWorkDuration(plannedTotal)} planned · ${formatWorkDuration(loggedTotal)} logged across ${categoryMinutes.length} categor${categoryMinutes.length === 1 ? "y" : "ies"}`
    ),
    buildTrendsCorrelationCard(trendsCorrelations(bounds)),
    buildTrendsHabitCard(bounds),
    buildTrendsHourCard({
      title: "When the hours happen",
      subtitle: "Logged minutes by time of day, across the whole range",
      series: [
        { label: "Productive (W B S C)", color: "var(--chart-1)", values: trendsHourMinutes(bounds, ["W", "B", "S", "C"]) },
        { label: "Waste (X)", color: "var(--chart-2)", values: trendsHourMinutes(bounds, ["X"]) }
      ],
      fmt: (value) => formatWorkDuration(value),
      footNote: "Blocks are split across every hour they span, so a long session is not filed under its first hour"
    }),
    buildTrendsHourCard({
      title: "When things get done, and go wrong",
      subtitle: "Tasks ticked off and lessons logged, by hour of the day",
      series: [
        { label: "Tasks completed", color: "var(--chart-3)", values: hourEvents.completions },
        { label: "Lessons logged", color: "var(--chart-4)", values: hourEvents.mistakes }
      ],
      fmt: (value) => String(value),
      footNote: "Lessons captured after the fact carry no timestamp and are not counted here"
    }),
    buildTrendsLineCard({
      title: "Journal volume",
      subtitle: "Words in the day's document, however they got there — typed, quick journal or blind journaling",
      series: [{ label: "Words", color: "var(--chart-1)", points: trendsJournalWordPoints(bounds) }],
      yMin: 0,
      fmtValue: (v) => String(Math.round(v))
    })
  );

  container.append(grid);
}

// The same window collectTrendsRows() applies to entries, expressed as dates so
// the calendar and goal log can be filtered by it too.
function trendsRangeBounds() {
  const today = todayISO();
  if (trendsRangeDays <= 0) return { from: "", to: today };
  const date = new Date(`${today}T12:00:00`);
  date.setDate(date.getDate() - (trendsRangeDays - 1));
  const offset = date.getTimezoneOffset();
  return { from: new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10), to: today };
}

function trendsInBounds(dateString, bounds) {
  const day = String(dateString || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  return day <= bounds.to && (!bounds.from || day >= bounds.from);
}

// Buckets rather than an average: the interesting question is not "how many hours
// of lead time on average" but "how often was there a plan before the day
// started", and a single mean hides the retroactive blocks completely.
function trendsBucketCounts(values, buckets) {
  const items = buckets.map((bucket) => ({ label: bucket.label, value: 0 }));
  for (const value of values) {
    const index = buckets.findIndex((bucket) => value >= bucket.min && value < bucket.max);
    if (index >= 0) items[index].value += 1;
  }
  return { items: items.filter((item) => item.value > 0), total: values.length };
}

function trendsPlanLeadCounts(bounds) {
  const hours = [];
  for (const event of state.calendarEvents || []) {
    if (!event || event.kind !== "plan" || !event.createdAt || !event.start) continue;
    if (!trendsInBounds(event.start, bounds)) continue;
    const lead = (new Date(event.start) - new Date(event.createdAt)) / 3600000;
    if (Number.isFinite(lead)) hours.push(lead);
  }
  return trendsBucketCounts(hours, [
    { label: "Night before or earlier (12h+)", min: 12, max: Infinity },
    { label: "Same morning (6–12h)", min: 6, max: 12 },
    { label: "A few hours ahead (1–6h)", min: 1, max: 6 },
    { label: "Just before it started (<1h)", min: 0, max: 1 },
    { label: "After it had already started", min: -Infinity, max: 0 }
  ]);
}

function trendsLoggingLagCounts(bounds) {
  const hours = [];
  for (const event of state.calendarEvents || []) {
    if (!event || event.kind !== "actual" || !event.createdAt || !event.end) continue;
    if (!trendsInBounds(event.start || event.end, bounds)) continue;
    const lag = (new Date(event.createdAt) - new Date(event.end)) / 3600000;
    if (Number.isFinite(lag)) hours.push(lag);
  }
  return trendsBucketCounts(hours, [
    { label: "As it happened (<1h)", min: -Infinity, max: 1 },
    { label: "Within a few hours (1–6h)", min: 1, max: 6 },
    { label: "Later the same day (6–24h)", min: 6, max: 24 },
    { label: "A day or more later", min: 24, max: Infinity }
  ]);
}

// check/miss are the two ways of answering "did I do it". Coverage below is the
// separate question of whether it was answered at all; keeping them apart is the
// whole point of the "unanswered" kind.
function trendsGoalTallies(bounds) {
  const tallies = new Map();
  const of = (goalId) => {
    if (!tallies.has(goalId)) tallies.set(goalId, { done: 0, missed: 0, unanswered: 0, materialized: 0 });
    return tallies.get(goalId);
  };
  // The log is append-only, so a day that was answered twice -- an edited
  // rating, or a false miss the evidence sweep later corrected -- holds more
  // than one outcome row. Counting them all made one day worth two days and
  // let a superseded miss go on dragging the rate down forever. One outcome
  // per (goal, date), newest wins, which is the reader contract the rest of
  // the goal code already follows.
  const outcomes = new Map();
  for (const event of goalLog || []) {
    if (!event || !event.goalId || !trendsInBounds(event.date, bounds)) continue;
    // A goal you deliberately dropped should stop scoring you. Its rows stay in
    // the log -- nothing is deleted -- but archiving is the statement that the
    // habit is over, and a rate that keeps counting it is measuring a decision
    // rather than a performance.
    if (trendsGoalArchived(event.goalId)) continue;
    if (event.kind === "materialize") {
      of(event.goalId).materialized += 1;
      continue;
    }
    const key = `${event.date}|${event.goalId}`;
    const found = outcomes.get(key);
    if (!found || String(event.ts) >= String(found.ts)) outcomes.set(key, event);
  }
  for (const event of outcomes.values()) {
    const tally = of(event.goalId);
    if (event.kind === "unanswered") tally.unanswered += 1;
    else if (event.kind === "miss" || event.value === false) tally.missed += 1;
    else if (event.kind === "check" || event.kind === "count" || event.kind === "rating") tally.done += 1;
  }
  return tallies;
}

function trendsGoalTitle(goalId) {
  const goal = (goalsDoc.goals || []).find((entry) => entry && entry.id === goalId);
  return (goal && (goal.title || goal.taskText)) || goalId;
}

// Looked up here rather than through goalById() so the trends helpers stay a
// self-contained slice: they read goalsDoc and goalLog and nothing else.
function trendsGoalArchived(goalId) {
  const goal = (goalsDoc.goals || []).find((entry) => entry && entry.id === goalId);
  return Boolean(goal && goal.archived);
}

function trendsGoalFollowThrough(bounds) {
  const items = [];
  for (const [goalId, tally] of trendsGoalTallies(bounds)) {
    const answered = tally.done + tally.missed;
    if (!answered) continue;
    items.push({
      label: `${trendsGoalTitle(goalId)} (${tally.done}/${answered})`,
      value: Math.round((tally.done / answered) * 100)
    });
  }
  items.sort((a, b) => a.value - b.value || a.label.localeCompare(b.label));
  return { items, total: items.length };
}

function trendsGoalCoverage(bounds) {
  const items = [];
  for (const [goalId, tally] of trendsGoalTallies(bounds)) {
    if (!tally.materialized) continue;
    const answered = tally.done + tally.missed;
    items.push({
      label: `${trendsGoalTitle(goalId)} (${answered}/${tally.materialized})`,
      value: Math.round((answered / tally.materialized) * 100)
    });
  }
  items.sort((a, b) => a.value - b.value || a.label.localeCompare(b.label));
  return { items, total: items.length };
}

function trendsRevisionPoints(bounds) {
  return Object.keys(state.entries)
    .filter((date) => trendsInBounds(date, bounds))
    .sort()
    .map((date) => ({ date, value: Number(state.entries[date]?._revision) || 0 }))
    .filter((point) => point.value > 0);
}

function collectTrendsRows() {
  const today = todayISO();
  let cutoff = null;
  if (trendsRangeDays > 0) {
    const date = new Date(`${today}T12:00:00`);
    date.setDate(date.getDate() - (trendsRangeDays - 1));
    const offset = date.getTimezoneOffset();
    cutoff = new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
  }
  return Object.keys(state.entries)
    .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date) && date <= today && (!cutoff || date >= cutoff))
    .sort()
    .map((date) => {
      const entry = state.entries[date] || {};
      return {
        date,
        morning: (entry.morning && entry.morning.survey) || {},
        night: (entry.night && entry.night.survey) || {}
      };
    })
    .filter((row) => trendsSessionFilled(row.morning) || trendsSessionFilled(row.night));
}

function trendsSessionFilled(survey) {
  return Object.values(survey).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === "object") return Boolean(trendsAnswerText(value.text));
    return Boolean(trendsAnswerText(value));
  });
}

function trendsAnswerText(value) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function parseTrendsFields(value) {
  const text = trendsAnswerText(value);
  if (!text) return {};
  const fields = {};
  for (const part of text.split(";")) {
    const idx = part.indexOf(":");
    if (idx === -1) continue;
    const label = part.slice(0, idx).trim();
    if (label) fields[label] = part.slice(idx + 1).trim();
  }
  return fields;
}

function parseTrendsClock(text) {
  const match = /^(\d{1,2}):(\d{2})/.exec((text || "").trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 24 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function parseTrendsNumber(text) {
  const match = /-?\d+(?:\.\d+)?/.exec(text || "");
  return match ? Number(match[0]) : null;
}

function sliderPoints(rows, session, questionId, fieldLabel) {
  const points = [];
  for (const row of rows) {
    const fields = parseTrendsFields(row[session][questionId]);
    const value = parseTrendsNumber(fields[fieldLabel]);
    if (value != null) points.push({ date: row.date, value });
  }
  return points;
}

function sleepDurationPoints(rows) {
  const points = [];
  for (const row of rows) {
    const fields = parseTrendsFields(row.morning.sleep);
    const asleep = parseTrendsClock(fields["Time I fell asleep"]);
    const woke = parseTrendsClock(fields["Time I woke up"]);
    if (asleep == null || woke == null) continue;
    let minutes = woke - asleep;
    if (minutes <= 0) minutes += 24 * 60;
    if (minutes > 20 * 60) continue;
    points.push({ date: row.date, value: minutes / 60 });
  }
  return points;
}

function weightPoints(rows) {
  const points = [];
  for (const row of rows) {
    const value = parseTrendsNumber(trendsAnswerText(row.morning.weight));
    if (value != null && value >= 60 && value <= 500) points.push({ date: row.date, value });
  }
  return points;
}

function multiCounts(rows, session, questionId) {
  const counts = new Map();
  let answeredDays = 0;
  for (const row of rows) {
    const text = trendsAnswerText(row[session][questionId]);
    if (!text) continue;
    answeredDays += 1;
    for (const raw of text.split(",")) {
      const token = raw.trim();
      if (token) counts.set(token, (counts.get(token) || 0) + 1);
    }
  }
  const items = [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
  return { items, answeredDays };
}

function singleCounts(rows, session, questionId) {
  const counts = new Map();
  let answeredDays = 0;
  for (const row of rows) {
    const text = trendsAnswerText(row[session][questionId]);
    if (!text) continue;
    answeredDays += 1;
    counts.set(text, (counts.get(text) || 0) + 1);
  }
  const items = [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
  return { items, answeredDays };
}

function trendsMean(points) {
  if (!points.length) return null;
  return points.reduce((sum, point) => sum + point.value, 0) / points.length;
}

function formatHoursMinutes(hours) {
  const total = Math.round(hours * 60);
  return `${Math.floor(total / 60)}h ${String(total % 60).padStart(2, "0")}m`;
}

function buildTrendsTiles(rows) {
  const tiles = document.createElement("div");
  tiles.className = "trends-tiles";
  const sleep = trendsMean(sleepDurationPoints(rows));
  const quality = trendsMean(sliderPoints(rows, "morning", "quality", "Sleep quality"));
  const joy = trendsMean(sliderPoints(rows, "night", "mental", "How much joy?"));
  const weights = weightPoints(rows);
  const morningFilled = rows.filter((row) => trendsSessionFilled(row.morning)).length;
  const nightFilled = rows.filter((row) => trendsSessionFilled(row.night)).length;

  tiles.append(trendsTile("Avg sleep", sleep == null ? "—" : formatHoursMinutes(sleep), `${sleepDurationPoints(rows).length} nights`));
  tiles.append(trendsTile("Avg sleep quality", quality == null ? "—" : `${quality.toFixed(1)} / 5`, "morning survey"));
  tiles.append(trendsTile("Avg joy", joy == null ? "—" : `${joy.toFixed(1)} / 5`, "night survey"));
  if (weights.length) {
    const latest = weights[weights.length - 1].value;
    const delta = latest - weights[0].value;
    const deltaText = weights.length > 1 ? `${delta >= 0 ? "+" : ""}${delta.toFixed(1)} lbs over range` : "single weigh-in";
    tiles.append(trendsTile("Weight", `${latest.toFixed(1)} lbs`, deltaText));
  } else {
    tiles.append(trendsTile("Weight", "—", "no weigh-ins"));
  }
  tiles.append(trendsTile("Surveys filled", `${morningFilled} / ${nightFilled}`, "morning / night days"));
  return tiles;
}

function trendsTile(label, value, sub) {
  const tile = document.createElement("div");
  tile.className = "trends-tile";
  const labelEl = document.createElement("span");
  labelEl.className = "trends-tile-label";
  labelEl.textContent = label;
  const valueEl = document.createElement("strong");
  valueEl.className = "trends-tile-value";
  valueEl.textContent = value;
  const subEl = document.createElement("span");
  subEl.className = "trends-tile-sub";
  subEl.textContent = sub;
  tile.append(labelEl, valueEl, subEl);
  return tile;
}

function trendsDateTime(date) {
  return new Date(`${date}T12:00:00`).getTime();
}

function trendsShortDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function trendsNiceTicks(min, max, count = 4) {
  const span = max - min || 1;
  const rawStep = span / count;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  let step = magnitude;
  for (const multiple of [1, 2, 2.5, 5, 10]) {
    if (magnitude * multiple >= rawStep) {
      step = magnitude * multiple;
      break;
    }
  }
  const start = Math.ceil(min / step) * step;
  const ticks = [];
  for (let tick = start; tick <= max + step * 0.001; tick += step) ticks.push(Number(tick.toFixed(6)));
  return ticks;
}

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  return el;
}

function buildTrendsLineCard(config) {
  const card = document.createElement("section");
  card.className = "trends-card wide";
  const head = document.createElement("div");
  head.className = "trends-card-head";
  const heading = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = config.title;
  heading.append(title);
  if (config.subtitle) {
    const subtitle = document.createElement("p");
    subtitle.className = "trends-card-subtitle";
    subtitle.textContent = config.subtitle;
    heading.append(subtitle);
  }
  head.append(heading);
  card.append(head);

  const series = config.series
    .map((entry) => ({ ...entry, points: entry.points.filter((point) => Number.isFinite(point.value)) }))
    .filter((entry) => entry.points.length);
  if (!series.length) {
    const empty = document.createElement("p");
    empty.className = "trends-empty";
    empty.textContent = "No data in this range.";
    card.append(empty);
    return card;
  }

  const tableButton = document.createElement("button");
  tableButton.type = "button";
  tableButton.className = "quiet trends-table-toggle";
  tableButton.textContent = "Data";
  head.append(tableButton);

  const dates = [...new Set(series.flatMap((entry) => entry.points.map((point) => point.date)))].sort();
  const t0 = trendsDateTime(dates[0]);
  const t1 = trendsDateTime(dates[dates.length - 1]);
  const span = Math.max(1, t1 - t0);
  const plotW = TRENDS_CHART_W - TRENDS_PLOT.left - TRENDS_PLOT.right;
  const plotH = TRENDS_CHART_H - TRENDS_PLOT.top - TRENDS_PLOT.bottom;
  const xFor = (date) => dates.length === 1
    ? TRENDS_PLOT.left + plotW / 2
    : TRENDS_PLOT.left + ((trendsDateTime(date) - t0) / span) * plotW;

  const values = series.flatMap((entry) => entry.points.map((point) => point.value));
  let yMin = config.yMin != null ? config.yMin : Math.min(...values);
  let yMax = config.yMax != null ? config.yMax : Math.max(...values);
  if (config.yMin == null && config.yMax == null) {
    const pad = (yMax - yMin || Math.abs(yMax) || 1) * 0.12;
    yMin -= pad;
    yMax += pad;
  } else if (yMax <= yMin) {
    yMax = yMin + 1;
  } else if (config.yMax == null) {
    yMax += (yMax - yMin) * 0.08;
  }
  const yFor = (value) => TRENDS_PLOT.top + plotH - ((value - yMin) / (yMax - yMin)) * plotH;
  const fmtValue = config.fmtValue || ((v) => v.toFixed(1));

  const chartWrap = document.createElement("div");
  chartWrap.className = "trends-chart-wrap";
  const svg = svgEl("svg", {
    viewBox: `0 0 ${TRENDS_CHART_W} ${TRENDS_CHART_H}`,
    class: "trends-line-chart",
    role: "img"
  });

  for (const tick of trendsNiceTicks(yMin, yMax)) {
    const y = yFor(tick);
    svg.append(svgEl("line", { x1: TRENDS_PLOT.left, x2: TRENDS_PLOT.left + plotW, y1: y, y2: y, class: "trends-grid-line" }));
    const label = svgEl("text", { x: TRENDS_PLOT.left - 8, y: y + 3.5, class: "trends-axis-label", "text-anchor": "end" });
    label.textContent = String(tick);
    svg.append(label);
  }
  const tickCount = Math.min(dates.length, 6);
  const seenXLabels = new Set();
  for (let i = 0; i < tickCount; i += 1) {
    const date = dates[Math.round((i / Math.max(1, tickCount - 1)) * (dates.length - 1))];
    if (seenXLabels.has(date)) continue;
    seenXLabels.add(date);
    const label = svgEl("text", { x: xFor(date), y: TRENDS_CHART_H - 8, class: "trends-axis-label", "text-anchor": "middle" });
    label.textContent = trendsShortDate(date);
    svg.append(label);
  }
  svg.append(svgEl("line", {
    x1: TRENDS_PLOT.left, x2: TRENDS_PLOT.left + plotW,
    y1: TRENDS_PLOT.top + plotH, y2: TRENDS_PLOT.top + plotH,
    class: "trends-baseline"
  }));

  const crosshair = svgEl("line", { y1: TRENDS_PLOT.top, y2: TRENDS_PLOT.top + plotH, class: "trends-crosshair hidden" });
  svg.append(crosshair);

  const endLabelYs = [];
  for (const entry of series) {
    const path = entry.points
      .map((point, index) => `${index === 0 ? "M" : "L"}${xFor(point.date).toFixed(1)},${yFor(point.value).toFixed(1)}`)
      .join(" ");
    svg.append(svgEl("path", { d: path, class: "trends-series-line", stroke: entry.color }));
    const last = entry.points[entry.points.length - 1];
    svg.append(svgEl("circle", { cx: xFor(last.date), cy: yFor(last.value), r: 4, fill: entry.color, class: "trends-end-dot" }));
    // Nudge colliding end labels apart so converging series stay readable.
    let labelY = yFor(last.value) + 4;
    while (endLabelYs.some((used) => Math.abs(used - labelY) < 14)) labelY += 14;
    endLabelYs.push(labelY);
    const endLabel = svgEl("text", { x: TRENDS_PLOT.left + plotW + 12, y: labelY, class: "trends-end-label" });
    const valueSpan = svgEl("tspan", { class: "trends-end-value" });
    valueSpan.textContent = fmtValue(last.value);
    endLabel.append(valueSpan);
    if (series.length > 1) {
      const nameSpan = svgEl("tspan", { dx: 4, class: "trends-end-name" });
      nameSpan.textContent = entry.label;
      endLabel.append(nameSpan);
    }
    svg.append(svgEl("line", {
      x1: TRENDS_PLOT.left + plotW + 2, x2: TRENDS_PLOT.left + plotW + 9,
      y1: yFor(last.value), y2: labelY - 3.5,
      class: "trends-leader", stroke: entry.color
    }));
    svg.append(endLabel);
  }

  chartWrap.append(svg);
  const tooltip = document.createElement("div");
  tooltip.className = "trends-tooltip hidden";
  chartWrap.append(tooltip);
  card.append(chartWrap);

  if (series.length > 1) {
    const legend = document.createElement("div");
    legend.className = "trends-legend";
    for (const entry of series) {
      const item = document.createElement("span");
      item.className = "trends-legend-item";
      const key = document.createElement("span");
      key.className = "trends-legend-key";
      key.style.background = entry.color;
      const name = document.createElement("span");
      name.textContent = entry.label;
      item.append(key, name);
      legend.append(item);
    }
    card.append(legend);
  }

  const table = document.createElement("table");
  table.className = "trends-table hidden";
  const headRow = document.createElement("tr");
  for (const text of ["Date", ...series.map((entry) => entry.label)]) {
    const th = document.createElement("th");
    th.textContent = text;
    headRow.append(th);
  }
  table.append(headRow);
  for (const date of dates) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.textContent = date;
    tr.append(td);
    for (const entry of series) {
      const cell = document.createElement("td");
      const point = entry.points.find((p) => p.date === date);
      cell.textContent = point ? fmtValue(point.value) : "";
      tr.append(cell);
    }
    table.append(tr);
  }
  card.append(table);
  tableButton.addEventListener("click", () => {
    const showTable = table.classList.toggle("hidden");
    tableButton.classList.toggle("active", !showTable);
  });

  svg.addEventListener("pointermove", (event) => {
    const rect = svg.getBoundingClientRect();
    if (!rect.width) return;
    const viewX = ((event.clientX - rect.left) / rect.width) * TRENDS_CHART_W;
    let nearest = dates[0];
    let nearestDistance = Infinity;
    for (const date of dates) {
      const distance = Math.abs(xFor(date) - viewX);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = date;
      }
    }
    const snapX = xFor(nearest);
    crosshair.setAttribute("x1", snapX);
    crosshair.setAttribute("x2", snapX);
    crosshair.classList.remove("hidden");
    tooltip.innerHTML = "";
    const when = document.createElement("div");
    when.className = "trends-tooltip-date";
    when.textContent = trendsShortDate(nearest);
    tooltip.append(when);
    for (const entry of series) {
      const point = entry.points.find((p) => p.date === nearest);
      if (!point) continue;
      const row = document.createElement("div");
      row.className = "trends-tooltip-row";
      const key = document.createElement("span");
      key.className = "trends-legend-key";
      key.style.background = entry.color;
      const value = document.createElement("strong");
      value.textContent = fmtValue(point.value);
      const name = document.createElement("span");
      name.className = "trends-tooltip-name";
      name.textContent = entry.label;
      row.append(key, value, name);
      tooltip.append(row);
    }
    tooltip.classList.remove("hidden");
    const pixelX = (snapX / TRENDS_CHART_W) * rect.width;
    const flip = pixelX > rect.width * 0.62;
    tooltip.style.left = flip ? "auto" : `${pixelX + 12}px`;
    tooltip.style.right = flip ? `${rect.width - pixelX + 12}px` : "auto";
    tooltip.style.top = `${Math.max(0, event.clientY - rect.top - 10)}px`;
  });
  svg.addEventListener("pointerleave", () => {
    crosshair.classList.add("hidden");
    tooltip.classList.add("hidden");
  });

  return card;
}

function buildTrendsBarCard(config) {
  const card = document.createElement("section");
  card.className = "trends-card";
  const title = document.createElement("h3");
  title.textContent = config.title;
  card.append(title);
  if (config.subtitle) {
    const subtitle = document.createElement("p");
    subtitle.className = "trends-card-subtitle";
    subtitle.textContent = config.subtitle;
    card.append(subtitle);
  }
  if (!config.items.length) {
    const empty = document.createElement("p");
    empty.className = "trends-empty";
    empty.textContent = "No data in this range.";
    card.append(empty);
    return card;
  }
  const maxItems = config.maxItems || 12;
  const items = config.items.slice(0, maxItems);
  const maxValue = Math.max(...items.map((item) => item.value));
  const list = document.createElement("div");
  list.className = "trends-bars";
  for (const item of items) {
    const row = document.createElement("div");
    row.className = "trends-bar-row";
    const label = document.createElement("span");
    label.className = "trends-bar-label";
    label.textContent = item.label;
    label.title = item.label;
    const track = document.createElement("span");
    track.className = "trends-bar-track";
    const bar = document.createElement("span");
    bar.className = "trends-bar-fill";
    bar.style.width = `${Math.max(2, (item.value / maxValue) * 100)}%`;
    track.append(bar);
    const value = document.createElement("span");
    value.className = "trends-bar-value";
    value.textContent = config.percent && config.answeredDays
      ? `${Math.round((item.value / config.answeredDays) * 100)}%`
      : `${item.value}${config.valueSuffix || ""}`;
    row.append(label, track, value);
    list.append(row);
  }
  card.append(list);
  const foot = document.createElement("p");
  foot.className = "trends-card-foot";
  const hidden = config.items.length - items.length;
  // Cards built from calendar blocks or goals are not counting answered days, so
  // they pass their own wording rather than inheriting the survey phrasing.
  const base = config.footNote || `${config.answeredDays} answered day${config.answeredDays === 1 ? "" : "s"}`;
  foot.textContent = `${base}${hidden > 0 ? ` · ${hidden} more not shown` : ""}`;
  card.append(foot);
  return card;
}

// ---------------------------------------------------------------------------
// Trends, second wave.
//
// Same rules as the section above: read-only, no server calls, scoped by the
// same range buttons. What is new is where the numbers come from. The cards
// above read survey answers; these read records the app was already keeping
// and never showed -- the block a task was planned into against the block it
// actually took, planned category hours against logged ones, which answers
// move together, whether a habit has a streak behind it, what time of day the
// day happens, and how much got written.
// ---------------------------------------------------------------------------

// "All time" hands back an empty `from`, so the walk needs a floor of its own.
// The cap is a backstop against a stray 1970 date turning a range button into
// a multi-thousand-iteration scan, and it trims the oldest end so the window
// always still reaches today.
const TRENDS_MAX_RANGE_DAYS = 800;
const TRENDS_MIN_CORRELATION_DAYS = 10;
const TRENDS_MIN_ESTIMATE_PAIRS = 3;
const TRENDS_HEATMAP_DAYS = 84;

function trendsRangeDateList(bounds) {
  let from = bounds.from;
  if (!from) {
    let oldest = bounds.to;
    for (const date of Object.keys(state.entries)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(date) && date < oldest) oldest = date;
    }
    for (const event of state.calendarEvents || []) {
      const date = String(event?.start || "").slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(date) && date < oldest) oldest = date;
    }
    from = oldest;
  }
  const list = [];
  for (let date = bounds.to; date >= from && list.length < TRENDS_MAX_RANGE_DAYS; date = shiftISODate(date, -1)) {
    list.push(date);
  }
  return list.reverse();
}

function trendsClockMinutes(value) {
  const match = /T(\d{2}):(\d{2})/.exec(String(value || ""));
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

// One day's timed blocks, already clipped to the day by eventsForDay() and with
// recurrence expanded. Going through eventsForDay rather than filtering
// state.calendarEvents directly is what makes a weekly repeat count once per
// occurrence instead of once ever.
function trendsDayBlocks(date) {
  const blocks = [];
  for (const event of eventsForDay(date)) {
    // A deadline has no duration, and the midnight-clip rule below would read
    // its zero length as a block running to midnight.
    if (!event || event.allDay || event.kind === "deadline") continue;
    // An archived plan was withdrawn, not missed: the current plan is the plan
    // of record, so old generations stay out of planned hours and pairing.
    if (event.kind === "plan" && event.supersededAt) continue;
    const startMin = trendsClockMinutes(event.start);
    const rawEnd = trendsClockMinutes(event.end);
    if (startMin == null || rawEnd == null) continue;
    // A block clipped at midnight comes back as the next day at 00:00. Read as
    // a clock that is midnight ending the day, not a zero-length block.
    const endMin = rawEnd <= startMin ? 1440 : rawEnd;
    blocks.push({
      date,
      kind: event.kind,
      tentative: Boolean(event.tentative),
      category: event.category || "",
      title: calendarEventFullTitle(event),
      taskId: event.taskId || "",
      startMin,
      endMin,
      minutes: endMin - startMin
    });
  }
  return blocks;
}

function trendsMedian(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function trendsCategoryLabel(code) {
  return categoryLabel(code) || (code ? `Category ${code}` : "No category");
}

function trendsTitleKey(title) {
  return String(title || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/* --- Estimate accuracy ------------------------------------------------------

   A plan block is an estimate made visible: click-to-place sizes it from the
   task's estimateMinutes, and a hand-drawn plan block is the same judgement
   made with the mouse. The actual block that follows is what really happened.

   Pairing prefers taskId, which is exact -- but click-to-place only landed in
   August, so almost the whole history has to be matched the other way: same
   day, same title. Each actual is claimed once, so a plan block repeated three
   times in a day lines up with three separate actuals rather than all three
   scoring against the first.
--------------------------------------------------------------------------- */

function trendsEstimatePairs(bounds) {
  const plans = [];
  const actualsByDay = new Map();
  for (const date of trendsRangeDateList(bounds)) {
    for (const block of trendsDayBlocks(date)) {
      if (block.minutes <= 0) continue;
      if (block.kind === "plan") {
        plans.push(block);
      } else {
        if (!actualsByDay.has(date)) actualsByDay.set(date, []);
        actualsByDay.get(date).push(block);
      }
    }
  }
  const claimed = new Set();
  const blockKey = (block) => `${block.date}|${block.startMin}|${block.endMin}|${block.title}`;
  const pairs = [];
  for (const plan of plans) {
    const candidates = actualsByDay.get(plan.date) || [];
    let match = plan.taskId
      ? candidates.find((block) => block.taskId === plan.taskId && !claimed.has(blockKey(block)))
      : null;
    if (!match) {
      const key = trendsTitleKey(plan.title);
      if (!key) continue;
      match = candidates.find((block) => trendsTitleKey(block.title) === key && !claimed.has(blockKey(block)));
    }
    if (!match) continue;
    claimed.add(blockKey(match));
    pairs.push({
      date: plan.date,
      title: plan.title,
      category: plan.category || match.category || "",
      planned: plan.minutes,
      actual: match.minutes,
      ratio: match.minutes / plan.minutes
    });
  }
  return pairs;
}

function trendsEstimateBuckets(pairs) {
  return trendsBucketCounts(pairs.map((pair) => pair.ratio), [
    { label: "Under half the time planned", min: 0, max: 0.5 },
    { label: "Half to three-quarters", min: 0.5, max: 0.75 },
    { label: "Close to plan (¾ to 1¼)", min: 0.75, max: 1.25 },
    { label: "Up to twice as long", min: 1.25, max: 2 },
    { label: "More than twice as long", min: 2, max: Infinity }
  ]);
}

// Median, not mean: one block that ran eight times over its plan would drag an
// average into uselessness, and the question here is what a typical block does.
function trendsEstimateByCategory(pairs) {
  const groups = new Map();
  for (const pair of pairs) {
    const code = pair.category || "";
    if (!groups.has(code)) groups.set(code, []);
    groups.get(code).push(pair.ratio);
  }
  const items = [];
  for (const [code, ratios] of groups) {
    if (ratios.length < TRENDS_MIN_ESTIMATE_PAIRS) continue;
    items.push({
      label: `${trendsCategoryLabel(code)} (${ratios.length})`,
      value: Math.round(trendsMedian(ratios) * 100)
    });
  }
  // Furthest from spot-on first: a category you read correctly needs no work.
  items.sort((a, b) => Math.abs(b.value - 100) - Math.abs(a.value - 100) || a.label.localeCompare(b.label));
  return { items, total: items.length };
}

/* --- Planned against logged, by category ----------------------------------- */

function trendsCategoryMinutes(bounds) {
  const totals = new Map();
  for (const date of trendsRangeDateList(bounds)) {
    for (const block of trendsDayBlocks(date)) {
      if (!block.category || block.minutes <= 0) continue;
      // An FYI block was never a commitment, so it cannot count as time the
      // plan meant to spend -- office hours skipped are not hours missed.
      if (block.kind === "plan" && block.tentative) continue;
      if (!totals.has(block.category)) totals.set(block.category, { plan: 0, actual: 0 });
      const bucket = totals.get(block.category);
      if (block.kind === "plan") bucket.plan += block.minutes;
      else bucket.actual += block.minutes;
    }
  }
  return [...totals.entries()]
    .map(([code, value]) => ({ code, label: trendsCategoryLabel(code), ...value }))
    .filter((item) => item.plan > 0 || item.actual > 0)
    .sort((a, b) => b.actual + b.plan - (a.actual + a.plan));
}

function buildTrendsPlanActualCard(items, footNote) {
  const card = document.createElement("section");
  card.className = "trends-card wide";
  const title = document.createElement("h3");
  title.textContent = "Planned hours against logged hours";
  card.append(title);
  const subtitle = document.createElement("p");
  subtitle.className = "trends-card-subtitle";
  subtitle.textContent = "Where the time was meant to go, against where it went. Busiest category first";
  card.append(subtitle);
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "trends-empty";
    empty.textContent = "No categorised blocks in this range.";
    card.append(empty);
    return card;
  }
  const maxMinutes = Math.max(...items.map((item) => Math.max(item.plan, item.actual)));
  const list = document.createElement("div");
  list.className = "trends-split-bars";
  for (const item of items.slice(0, 14)) {
    const row = document.createElement("div");
    row.className = "trends-split-row";
    const label = document.createElement("span");
    label.className = "trends-bar-label";
    label.textContent = item.label;
    label.title = item.label;
    const tracks = document.createElement("span");
    tracks.className = "trends-split-tracks";
    for (const part of [
      { key: "plan", minutes: item.plan },
      { key: "actual", minutes: item.actual }
    ]) {
      const track = document.createElement("span");
      track.className = "trends-bar-track";
      const bar = document.createElement("span");
      bar.className = `trends-bar-fill is-${part.key}`;
      bar.style.width = `${maxMinutes ? Math.max(part.minutes ? 2 : 0, (part.minutes / maxMinutes) * 100) : 0}%`;
      track.append(bar);
      tracks.append(track);
    }
    const value = document.createElement("span");
    value.className = "trends-split-value";
    const delta = item.actual - item.plan;
    // The plan side is blank for a category that was only ever logged after the
    // fact, and "+7h against no plan" is a different statement from overrunning.
    value.textContent = item.plan
      ? `${formatWorkDuration(item.plan)} → ${formatWorkDuration(item.actual)} (${delta >= 0 ? "+" : "−"}${formatWorkDuration(Math.abs(delta))})`
      : `${formatWorkDuration(item.actual)} logged, none planned`;
    row.append(label, tracks, value);
    list.append(row);
  }
  card.append(list);
  const legend = document.createElement("div");
  legend.className = "trends-legend";
  for (const part of [{ key: "plan", label: "Planned" }, { key: "actual", label: "Logged" }]) {
    const item = document.createElement("span");
    item.className = "trends-legend-item";
    const key = document.createElement("span");
    key.className = `trends-legend-key is-${part.key}`;
    const text = document.createElement("span");
    text.textContent = part.label;
    item.append(key, text);
    legend.append(item);
  }
  card.append(legend);
  const foot = document.createElement("p");
  foot.className = "trends-card-foot";
  foot.textContent = footNote;
  card.append(foot);
  return card;
}

/* --- What moves with what ---------------------------------------------------

   Curated inputs against curated outcomes rather than every pair of every
   variable: with this many fields an all-pairs sweep produces a few hundred
   coefficients, and at that count a handful clear r = 0.5 on noise alone.

   Missing and zero are kept apart on purpose. A day with no actual blocks
   logged is a day with no record of its hours, not a day with none -- counting
   it as zero would manufacture a correlation between not logging and
   everything else.
--------------------------------------------------------------------------- */

const TRENDS_CORRELATION_INPUTS = [
  { key: "sleepHours", label: "Sleep duration" },
  { key: "sleepQuality", label: "Sleep quality" },
  { key: "wakeUps", label: "Mid-sleep wake-ups" },
  { key: "exercised", label: "Exercised" },
  { key: "workHours", label: "Work hours logged" },
  { key: "wasteHours", label: "Wasted hours logged" },
  { key: "socialHours", label: "Social hours logged" },
  { key: "mistakes", label: "Lessons logged" },
  { key: "journalWords", label: "Words journalled" },
  { key: "tasksDone", label: "Tasks completed" },
  { key: "screens", label: "Screens flagged" },
  { key: "caffeine", label: "Caffeine flagged" },
  { key: "weight", label: "Weight" }
];

const TRENDS_CORRELATION_OUTCOMES = [
  { key: "joy", label: "joy" },
  { key: "gotDone", label: "getting things done" },
  { key: "sleepQuality", label: "sleep quality" },
  { key: "energy", label: "waking energy" }
];

const TRENDS_SOCIAL_CATEGORIES = ["G", "F", "D", "N"];

function trendsVariableTable(bounds) {
  const table = new Map();
  for (const date of trendsRangeDateList(bounds)) {
    const entry = state.entries[date];
    const morning = entry?.morning?.survey || {};
    const night = entry?.night?.survey || {};
    const row = {};

    const sleepFields = parseTrendsFields(morning.sleep);
    const asleep = parseTrendsClock(sleepFields["Time I fell asleep"]);
    const woke = parseTrendsClock(sleepFields["Time I woke up"]);
    if (asleep != null && woke != null) {
      let minutes = woke - asleep;
      if (minutes <= 0) minutes += 24 * 60;
      if (minutes <= 20 * 60) row.sleepHours = minutes / 60;
    }
    const quality = parseTrendsFields(morning.quality);
    const sleepQuality = parseTrendsNumber(quality["Sleep quality"]);
    if (sleepQuality != null) row.sleepQuality = sleepQuality;
    const wakeUps = parseTrendsNumber(quality["Number of wake-ups"]);
    if (wakeUps != null) row.wakeUps = wakeUps;
    const energy = parseTrendsNumber(quality["How energetic do you feel waking up?"]);
    if (energy != null) row.energy = energy;
    const weight = parseTrendsNumber(trendsAnswerText(morning.weight));
    if (weight != null && weight >= 60 && weight <= 500) row.weight = weight;

    const mental = parseTrendsFields(night.mental);
    for (const [key, field] of [
      ["joy", "How much joy?"],
      ["gotDone", "Did I get done what I needed to today?"]
    ]) {
      const value = parseTrendsNumber(mental[field]);
      if (value != null) row[key] = value;
    }
    // Only a filled night survey can say "no exercise". An untouched one says
    // nothing, and must not be read as a zero.
    if (trendsSessionFilled(night)) {
      row.exercised = splitAnswer(night.exercise).length ? 1 : 0;
    }
    if (trendsSessionFilled(morning)) {
      const disruptions = splitAnswer(morning.disruption).map((token) => token.toLowerCase());
      row.screens = disruptions.includes("screens") ? 1 : 0;
      row.caffeine = disruptions.includes("caffeine") ? 1 : 0;
    }

    const blocks = trendsDayBlocks(date).filter((block) => block.kind === "actual");
    if (blocks.length) {
      const sum = (codes) => blocks
        .filter((block) => codes.includes(block.category))
        .reduce((total, block) => total + block.minutes, 0) / 60;
      row.workHours = sum(["W"]);
      row.wasteHours = sum(["X"]);
      row.socialHours = sum(TRENDS_SOCIAL_CATEGORIES);
    }

    if (entry) {
      row.mistakes = (entry.mistakes || []).length;
      row.journalWords = trendsWordCount(entry);
      row.tasksDone = (entry.tasks?.completed || []).length;
    }
    table.set(date, row);
  }
  return table;
}

function trendsWordCount(entry) {
  const text = String(entry?.journal || "").trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

function trendsPearson(pairs) {
  const n = pairs.length;
  if (n < 2) return null;
  let sumX = 0;
  let sumY = 0;
  for (const [x, y] of pairs) {
    sumX += x;
    sumY += y;
  }
  const meanX = sumX / n;
  const meanY = sumY / n;
  let covariance = 0;
  let varX = 0;
  let varY = 0;
  for (const [x, y] of pairs) {
    const dx = x - meanX;
    const dy = y - meanY;
    covariance += dx * dy;
    varX += dx * dx;
    varY += dy * dy;
  }
  // A variable that never moved has no direction to share with anything.
  if (varX <= 0 || varY <= 0) return null;
  return covariance / Math.sqrt(varX * varY);
}

function trendsCorrelations(bounds) {
  const table = trendsVariableTable(bounds);
  const dates = [...table.keys()].sort();
  const results = [];
  for (const input of TRENDS_CORRELATION_INPUTS) {
    for (const outcome of TRENDS_CORRELATION_OUTCOMES) {
      for (const lag of [0, 1]) {
        if (lag === 0 && input.key === outcome.key) continue;
        const pairs = [];
        for (const date of dates) {
          const source = table.get(lag ? shiftISODate(date, -1) : date);
          const target = table.get(date);
          const x = source?.[input.key];
          const y = target?.[outcome.key];
          if (typeof x === "number" && typeof y === "number") pairs.push([x, y]);
        }
        if (pairs.length < TRENDS_MIN_CORRELATION_DAYS) continue;
        const r = trendsPearson(pairs);
        if (r == null) continue;
        results.push({
          label: lag
            ? `${input.label} → next-day ${outcome.label}`
            : `${input.label} → ${outcome.label}`,
          r,
          n: pairs.length
        });
      }
    }
  }
  results.sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
  return results;
}

function buildTrendsCorrelationCard(results) {
  const card = document.createElement("section");
  card.className = "trends-card wide";
  const title = document.createElement("h3");
  title.textContent = "What moves with what";
  card.append(title);
  const subtitle = document.createElement("p");
  subtitle.className = "trends-card-subtitle";
  subtitle.textContent = "Strongest associations in range. Association only — a link here is a question to ask, not a cause";
  card.append(subtitle);
  if (!results.length) {
    const empty = document.createElement("p");
    empty.className = "trends-empty";
    empty.textContent = `Needs at least ${TRENDS_MIN_CORRELATION_DAYS} days where both things were recorded. Widen the range.`;
    card.append(empty);
    return card;
  }
  const shown = results.slice(0, 14);
  const list = document.createElement("div");
  list.className = "trends-corr-bars";
  for (const item of shown) {
    const row = document.createElement("div");
    row.className = "trends-corr-row";
    const label = document.createElement("span");
    label.className = "trends-bar-label";
    label.textContent = item.label;
    label.title = `${item.label} (n = ${item.n})`;
    // One track with a centre line, filled left for negative and right for
    // positive, so direction is read from the side rather than from the sign.
    const track = document.createElement("span");
    track.className = "trends-corr-track";
    const zero = document.createElement("span");
    zero.className = "trends-corr-zero";
    const bar = document.createElement("span");
    bar.className = item.r >= 0 ? "trends-corr-fill is-positive" : "trends-corr-fill is-negative";
    bar.style.width = `${Math.min(50, Math.abs(item.r) * 50)}%`;
    track.append(zero, bar);
    const value = document.createElement("span");
    value.className = "trends-corr-value";
    value.textContent = `${item.r >= 0 ? "+" : "−"}${Math.abs(item.r).toFixed(2)} · n=${item.n}`;
    row.append(label, track, value);
    list.append(row);
  }
  card.append(list);
  const foot = document.createElement("p");
  foot.className = "trends-card-foot";
  const hidden = results.length - shown.length;
  foot.textContent = `${results.length} pair${results.length === 1 ? "" : "s"} tested with n ≥ ${TRENDS_MIN_CORRELATION_DAYS}${hidden > 0 ? ` · ${hidden} weaker not shown` : ""}`;
  card.append(foot);
  return card;
}

/* --- Habit grid and streaks -------------------------------------------------

   One outcome per (goal, date), newest wins -- the same reader contract
   trendsGoalTallies() follows, for the same reason: the log is append-only and
   a corrected miss is a second row, not an edit.

   A goal that never materialised on a date is blank, not a miss, and the
   streak walk steps straight over it. Context-scheduled goals are simply not
   asked on days outside their context, and a run of those days should neither
   break a streak nor pad one.
--------------------------------------------------------------------------- */

function trendsGoalDayStatus() {
  const status = new Map();
  for (const event of goalLog || []) {
    if (!event || !event.goalId || !/^\d{4}-\d{2}-\d{2}$/.test(String(event.date || ""))) continue;
    if (trendsGoalArchived(event.goalId)) continue;
    const key = `${event.goalId}|${event.date}`;
    const found = status.get(key);
    if (event.kind === "materialize") {
      if (!found) status.set(key, { kind: "materialize", ts: event.ts, goalId: event.goalId, date: event.date });
      continue;
    }
    if (found && found.kind !== "materialize" && String(event.ts) < String(found.ts)) continue;
    status.set(key, { kind: event.kind, value: event.value, ts: event.ts, goalId: event.goalId, date: event.date });
  }
  const byGoal = new Map();
  for (const event of status.values()) {
    let outcome = "none";
    if (event.kind === "unanswered") outcome = "unanswered";
    else if (event.kind === "miss" || event.value === false) outcome = "missed";
    else if (["check", "count", "rating"].includes(event.kind)) outcome = "done";
    else if (event.kind === "materialize") outcome = "pending";
    if (!byGoal.has(event.goalId)) byGoal.set(event.goalId, new Map());
    byGoal.get(event.goalId).set(event.date, outcome);
  }
  return byGoal;
}

// Walked from today backwards over every date the goal was ever asked on.
// `pending` is today's materialised-but-not-yet-answered row: it should not end
// a streak at breakfast, so it is skipped like an unscheduled day.
function trendsGoalStreaks(days) {
  const dates = [...days.keys()].sort();
  if (!dates.length) return { current: 0, longest: 0 };
  let current = 0;
  let longest = 0;
  let run = 0;
  /* A date that was never lived cannot break a run. The expiry sweep already
     declines to book a miss on one, but a stale row from before that existed --
     or one settled from the other side -- would still be sitting in the log, and
     a streak ended by a flight is the kind of wrong number that quietly makes
     the whole grid untrustworthy. Skipped here as well as at the source, and
     skipped rather than counted: getting on a plane is not adherence either. */
  const neverLived = (date) => typeof isShortZoneDate === "function" && isShortZoneDate(date);
  for (const date of dates) {
    const outcome = days.get(date);
    if (neverLived(date)) continue;
    if (outcome === "done") {
      run += 1;
      if (run > longest) longest = run;
    } else if (outcome === "missed" || outcome === "unanswered") {
      run = 0;
    }
  }
  for (let index = dates.length - 1; index >= 0; index -= 1) {
    const outcome = days.get(dates[index]);
    if (neverLived(dates[index])) continue;
    if (outcome === "done") current += 1;
    else if (outcome === "missed" || outcome === "unanswered") break;
  }
  return { current, longest };
}

function buildTrendsHabitCard(bounds) {
  const card = document.createElement("section");
  card.className = "trends-card wide";
  const title = document.createElement("h3");
  title.textContent = "Habit grid";
  card.append(title);
  const subtitle = document.createElement("p");
  subtitle.className = "trends-card-subtitle";
  subtitle.textContent = "One square per day the goal was asked. Streaks run over the whole log, not just this range";
  card.append(subtitle);

  const byGoal = trendsGoalDayStatus();
  const windowDates = trendsRangeDateList(bounds).slice(-TRENDS_HEATMAP_DAYS);
  const rows = [];
  for (const [goalId, days] of byGoal) {
    const inWindow = windowDates.filter((date) => days.has(date));
    if (!inWindow.length) continue;
    rows.push({ goalId, days, streaks: trendsGoalStreaks(days), answered: inWindow.length });
  }
  if (!rows.length) {
    const empty = document.createElement("p");
    empty.className = "trends-empty";
    empty.textContent = "No goal days in this range.";
    card.append(empty);
    return card;
  }
  // Longest current streak first: the run you would least like to drop is the
  // one worth seeing without scrolling.
  rows.sort((a, b) => b.streaks.current - a.streaks.current || b.answered - a.answered);

  const grid = document.createElement("div");
  grid.className = "trends-habit-grid";
  for (const row of rows.slice(0, 16)) {
    const line = document.createElement("div");
    line.className = "trends-habit-row";
    const label = document.createElement("span");
    label.className = "trends-bar-label";
    label.textContent = trendsGoalTitle(row.goalId);
    label.title = trendsGoalTitle(row.goalId);
    const squares = document.createElement("span");
    squares.className = "trends-habit-squares";
    for (const date of windowDates) {
      const outcome = row.days.get(date) || "none";
      const cell = document.createElement("span");
      cell.className = `trends-habit-cell is-${outcome}`;
      cell.title = `${trendsShortDate(date)} · ${outcome === "none" ? "not asked" : outcome}`;
      squares.append(cell);
    }
    const streak = document.createElement("span");
    streak.className = "trends-habit-streak";
    streak.textContent = `${row.streaks.current} now · ${row.streaks.longest} best`;
    line.append(label, squares, streak);
    grid.append(line);
  }
  card.append(grid);

  const legend = document.createElement("div");
  legend.className = "trends-legend";
  for (const [outcome, text] of [["done", "Done"], ["missed", "Missed"], ["unanswered", "Unanswered"], ["none", "Not asked"]]) {
    const item = document.createElement("span");
    item.className = "trends-legend-item";
    const key = document.createElement("span");
    key.className = `trends-habit-cell is-${outcome}`;
    const label = document.createElement("span");
    label.textContent = text;
    item.append(key, label);
    legend.append(item);
  }
  card.append(legend);
  const foot = document.createElement("p");
  foot.className = "trends-card-foot";
  const hidden = rows.length - Math.min(rows.length, 16);
  foot.textContent = `${windowDates.length} day window · ${rows.length} goal${rows.length === 1 ? "" : "s"}${hidden > 0 ? ` · ${hidden} more not shown` : ""}`;
  card.append(foot);
  return card;
}

/* --- Time of day ----------------------------------------------------------- */

function trendsHourMinutes(bounds, codes) {
  const hours = Array(24).fill(0);
  for (const date of trendsRangeDateList(bounds)) {
    for (const block of trendsDayBlocks(date)) {
      if (block.kind !== "actual" || !codes.includes(block.category)) continue;
      // Split across the hours it spans, so a 90-minute block is not filed
      // entirely under the hour it happened to begin in.
      for (let minute = block.startMin; minute < block.endMin && minute < 1440; minute += 1) {
        hours[Math.floor(minute / 60)] += 1;
      }
    }
  }
  return hours;
}

function trendsHourEvents(bounds) {
  const completions = Array(24).fill(0);
  const mistakes = Array(24).fill(0);
  for (const date of trendsRangeDateList(bounds)) {
    const entry = state.entries[date];
    if (!entry) continue;
    for (const task of entry.tasks?.completed || []) {
      const hour = new Date(task?.completedAt || "").getHours();
      if (Number.isFinite(hour)) completions[hour] += 1;
    }
    for (const mistake of entry.mistakes || []) {
      if (!mistake?.ts) continue;
      const hour = new Date(mistake.ts).getHours();
      if (Number.isFinite(hour)) mistakes[hour] += 1;
    }
  }
  return { completions, mistakes };
}

function buildTrendsHourCard(config) {
  const card = document.createElement("section");
  card.className = "trends-card wide";
  const title = document.createElement("h3");
  title.textContent = config.title;
  card.append(title);
  const subtitle = document.createElement("p");
  subtitle.className = "trends-card-subtitle";
  subtitle.textContent = config.subtitle;
  card.append(subtitle);
  const max = Math.max(0, ...config.series.flatMap((series) => series.values));
  if (!max) {
    const empty = document.createElement("p");
    empty.className = "trends-empty";
    empty.textContent = "No data in this range.";
    card.append(empty);
    return card;
  }
  const strip = document.createElement("div");
  strip.className = "trends-hour-strip";
  for (let hour = 0; hour < 24; hour += 1) {
    const column = document.createElement("div");
    column.className = "trends-hour-column";
    const stack = document.createElement("div");
    stack.className = "trends-hour-stack";
    for (const series of config.series) {
      const bar = document.createElement("span");
      bar.className = "trends-hour-bar";
      bar.style.height = `${(series.values[hour] / max) * 100}%`;
      bar.style.background = series.color;
      bar.title = `${String(hour).padStart(2, "0")}:00 · ${series.label}: ${config.fmt(series.values[hour])}`;
      stack.append(bar);
    }
    const label = document.createElement("span");
    label.className = "trends-hour-label";
    // Every third hour keeps the axis readable at 24 columns.
    label.textContent = hour % 3 === 0 ? String(hour).padStart(2, "0") : "";
    column.append(stack, label);
    strip.append(column);
  }
  card.append(strip);
  const legend = document.createElement("div");
  legend.className = "trends-legend";
  for (const series of config.series) {
    const item = document.createElement("span");
    item.className = "trends-legend-item";
    const key = document.createElement("span");
    key.className = "trends-legend-key";
    key.style.background = series.color;
    const label = document.createElement("span");
    const peak = series.values.indexOf(Math.max(...series.values));
    label.textContent = `${series.label} · peak ${String(peak).padStart(2, "0")}:00`;
    item.append(key, label);
    legend.append(item);
  }
  card.append(legend);
  const foot = document.createElement("p");
  foot.className = "trends-card-foot";
  foot.textContent = config.footNote;
  card.append(foot);
  return card;
}

/* --- Journal volume -------------------------------------------------------- */

function trendsJournalWordPoints(bounds) {
  return Object.keys(state.entries)
    .filter((date) => trendsInBounds(date, bounds))
    .sort()
    .map((date) => ({ date, value: trendsWordCount(state.entries[date]) }))
    .filter((point) => point.value > 0);
}

/* --- Monthly review ----------------------------------------------------------

   The −5..+5 monthly retrospective that used to live in "New Years Goals
   Progress Check-In.xlsx" (four columns: Goal / How well did I do / Explain /
   How should I change it for this next month, one ALL-CAPS row per category).
   The point of doing it here instead: every goal row shows the month's actual
   evidence from goal-log.json before the grade is typed, so the review grades
   the record rather than the memory of it.

   Grades live in monthly-reviews.json (server-owned, month-scoped writes, no
   part in the entry revision model — the goals rule). Imported months from the
   old workbook carry rows matched to goal ids by title where possible; they
   render as the "past grades" chips beside each goal.

   Entry point is a button in the Trends controls row, deliberately not a nav
   slot: this is a once-a-month surface and must not crowd the daily UI.
--------------------------------------------------------------------------- */

let reviewMonth = defaultReviewMonth();
let monthlyReviews = { version: 1, months: {} };
let monthlyReviewsLoaded = false;
let monthlyReviewSaveTimer = null;

// Late in a month the review being written is this month's; early in one it is
// almost always last month's, still being finished.
function defaultReviewMonth() {
  const today = todayISO();
  if (Number(today.slice(8, 10)) >= 25) return today.slice(0, 7);
  const date = new Date(`${today.slice(0, 7)}-01T12:00:00`);
  date.setDate(0);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function reviewMonthLabel(month) {
  const date = new Date(`${month}-01T12:00:00`);
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function shiftReviewMonth(delta) {
  const date = new Date(`${reviewMonth}-01T12:00:00`);
  date.setMonth(date.getMonth() + delta);
  const next = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  if (next > todayISO().slice(0, 7)) return;
  reviewMonth = next;
  renderMonthlyReviewView(true);
}

function reviewMonthDays(month) {
  return new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate();
}

async function loadMonthlyReviews() {
  try {
    const response = await fetch("/api/monthly-review");
    if (!response.ok) return;
    const doc = await response.json();
    if (doc && typeof doc.months === "object") {
      monthlyReviews = doc;
      monthlyReviewsLoaded = true;
    }
  } catch {
    // Offline: the view renders evidence without saved grades and says so.
  }
}

function reviewNormalizeTitle(title) {
  return String(title || "").toLowerCase().replace(/[^a-z0-9一-鿿]+/g, " ").trim();
}

// Goals in scope for a month: active for any part of it. An archived goal that
// ended mid-month is still reviewed once — dropping it is a decision the review
// should record, not hide.
function reviewGoalsForMonth(month) {
  const monthStart = `${month}-01`;
  const monthEnd = `${month}-${String(reviewMonthDays(month)).padStart(2, "0")}`;
  return goalsDoc.goals.filter((goal) => {
    if (!goal || !goal.title) return false;
    if (goal.activeFrom && goal.activeFrom > monthEnd) return false;
    if (goal.activeTo && goal.activeTo < monthStart) return false;
    return true;
  });
}

function reviewSavedRow(month, goal) {
  const rows = monthlyReviews.months?.[month]?.rows || [];
  const byId = rows.find((row) => row.goalId && row.goalId === goal.id);
  if (byId) return byId;
  const wanted = reviewNormalizeTitle(goal.title);
  return rows.find((row) => !row.header && reviewNormalizeTitle(row.title) === wanted) || null;
}

// "Jan +2 · Feb −4 · Mar +2" — the old workbook's grades for this goal, matched
// by id where the import resolved one and by normalised title otherwise.
function reviewPastGrades(goal, excludeMonth) {
  const parts = [];
  const wanted = reviewNormalizeTitle(goal.title);
  for (const month of Object.keys(monthlyReviews.months || {}).sort()) {
    if (month === excludeMonth) continue;
    const rows = monthlyReviews.months[month]?.rows || [];
    const row = rows.find((item) => !item.header && ((item.goalId && item.goalId === goal.id) || reviewNormalizeTitle(item.title) === wanted));
    if (!row || row.grade === null || row.grade === undefined) continue;
    const label = new Date(`${month}-01T12:00:00`).toLocaleDateString(undefined, { month: "short" });
    parts.push(`${label} ${row.grade > 0 ? "+" : ""}${row.grade}`);
  }
  return parts.join(" · ");
}

// One outcome per (goal, date), newest non-materialize wins — the same reader
// contract as trendsGoalTallies()/trendsGoalDayStatus(), scoped to one month.
function reviewMonthOutcomes(goalId, month) {
  const chosen = new Map();
  for (const event of goalLog || []) {
    if (!event || event.goalId !== goalId) continue;
    const date = String(event.date || "");
    if (!date.startsWith(`${month}-`)) continue;
    const found = chosen.get(date);
    if (event.kind === "materialize") {
      if (!found) chosen.set(date, event);
      continue;
    }
    if (found && found.kind !== "materialize" && String(event.ts) < String(found.ts)) continue;
    chosen.set(date, event);
  }
  const outcomes = new Map();
  for (const [date, event] of chosen) {
    let outcome = "none";
    if (event.kind === "unanswered") outcome = "unanswered";
    else if (event.kind === "miss" || event.value === false) outcome = "missed";
    else if (["check", "count", "rating"].includes(event.kind)) outcome = "done";
    else if (event.kind === "materialize") outcome = "pending";
    outcomes.set(date, { outcome, event });
  }
  return outcomes;
}

function reviewEvidenceText(goal, month) {
  const outcomes = reviewMonthOutcomes(goal.id, month);
  const counts = { done: 0, missed: 0, unanswered: 0 };
  let lastDone = "";
  const streakDays = new Map();
  for (const [date, { outcome }] of [...outcomes].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    if (outcome in counts) counts[outcome] += 1;
    if (outcome === "done" && date > lastDone) lastDone = date;
    if (outcome !== "pending") streakDays.set(date, outcome);
  }
  const parts = [];
  if (goal.type === "rule") {
    const scheduled = Object.entries(goalsDoc.ruleSchedule || {}).filter(
      ([date, id]) => id === goal.id && date.startsWith(`${month}-`)
    ).length;
    if (scheduled) parts.push(`rule of the day ${scheduled}×`);
    const ratings = [];
    for (const { event } of outcomes.values()) {
      if (event.kind === "rating" && Number.isFinite(Number(event.value))) ratings.push(Number(event.value));
    }
    if (ratings.length) {
      const avg = ratings.reduce((sum, value) => sum + value, 0) / ratings.length;
      parts.push(`rated ${ratings.length}×, avg ${avg > 0 ? "+" : ""}${avg.toFixed(1)}`);
    }
  }
  if (counts.done || counts.missed || counts.unanswered) {
    parts.push(`${counts.done} done · ${counts.missed} missed · ${counts.unanswered} unanswered`);
    const streaks = trendsGoalStreaks(streakDays);
    if (streaks.longest > 1) parts.push(`longest run ${streaks.longest}`);
    if (lastDone) parts.push(`last ${trendsShortDate(lastDone)}`);
  }
  if (!parts.length) return "No tracked evidence — graded from judgement.";
  return parts.join(" · ");
}

// The rows in the workbook's own order: one ALL-CAPS category row, then that
// category's goals. Used by the view, the TSV copy and the xlsx export alike so
// the three can never disagree about shape.
function reviewSheetRows(month, { includeHeader = true } = {}) {
  const result = [];
  if (includeHeader) {
    result.push({ cells: ["Goal", "How well did I do?", "Explain", "How should I change it for this next month?"] });
  }
  const record = monthlyReviews.months?.[month];
  const rowCells = (row) => ({
    goalId: row.goalId || "",
    cells: [row.title, row.grade === null || row.grade === undefined ? "" : row.grade, row.explain || "", row.change || ""]
  });
  // An imported month keeps its own row order wholesale — the goal roster of
  // 2026-08 says nothing about how January's sheet was laid out.
  if (record?.imported === true) {
    for (const row of record.rows || []) {
      result.push(row.header ? { header: true, cells: [row.title, "", "", ""] } : rowCells(row));
    }
    return result;
  }
  const goals = reviewGoalsForMonth(month);
  const categories = [];
  for (const goal of goals) {
    const category = String(goal.category || "OTHER");
    if (!categories.includes(category)) categories.push(category);
  }
  for (const category of categories) {
    result.push({ header: true, cells: [category, "", "", ""] });
    for (const goal of goals) {
      if (String(goal.category || "OTHER") !== category) continue;
      const saved = reviewSavedRow(month, goal);
      result.push({
        goalId: goal.id,
        cells: [
          goal.title,
          saved && saved.grade !== null && saved.grade !== undefined ? saved.grade : "",
          saved?.explain || "",
          saved?.change || ""
        ]
      });
    }
  }
  const extras = reviewUnmatchedRows(month, goals);
  if (extras.length) {
    result.push({ header: true, cells: ["OTHER (imported rows)", "", "", ""] });
    for (const row of extras) result.push(rowCells(row));
  }
  return result;
}

// What goes to disk is the month's own row list, never a rebuild from the
// current goal roster: an imported month (Jan–Mar predate goals.json) holds
// rows no 2026-08 goal matches, and a rebuild would silently drop them.
function reviewRowsForSave(month) {
  return monthlyReviews.months?.[month]?.rows || [];
}

// Rows saved for the month that no displayed goal claims — the imported
// workbook rows, plus anything from a goal since renamed out of recognition.
function reviewUnmatchedRows(month, goals) {
  const rows = monthlyReviews.months?.[month]?.rows || [];
  const claimedIds = new Set(goals.map((goal) => goal.id));
  const claimedTitles = new Set(goals.map((goal) => reviewNormalizeTitle(goal.title)));
  return rows.filter((row) => {
    if (!row || row.header) return false;
    if (row.goalId && claimedIds.has(row.goalId)) return false;
    return !claimedTitles.has(reviewNormalizeTitle(row.title));
  });
}

function reviewSetAnswer(month, goal, field, value) {
  if (!monthlyReviews.months) monthlyReviews.months = {};
  const record = monthlyReviews.months[month] || (monthlyReviews.months[month] = { rows: [] });
  let row = record.rows.find((item) => item.goalId === goal.id);
  if (!row) {
    const wanted = reviewNormalizeTitle(goal.title);
    row = record.rows.find((item) => !item.header && reviewNormalizeTitle(item.title) === wanted);
    if (row) row.goalId = goal.id;
  }
  if (!row) {
    row = { goalId: goal.id, title: goal.title, grade: null, explain: "", change: "" };
    record.rows.push(row);
  }
  row.title = goal.title;
  row[field] = value;
  scheduleMonthlyReviewSave(month);
}

function scheduleMonthlyReviewSave(month) {
  clearTimeout(monthlyReviewSaveTimer);
  monthlyReviewSaveTimer = setTimeout(() => saveMonthlyReviewToDisk(month), 600);
}

async function saveMonthlyReviewToDisk(month) {
  // A doc that never loaded is not a doc to write back: posting rows built over
  // an empty months map would erase every grade already on disk for the month.
  if (!monthlyReviewsLoaded) return;
  try {
    const response = await fetch("/api/monthly-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, rows: reviewRowsForSave(month) })
    });
    if (response.ok) {
      const reviewStatus = document.getElementById("reviewSaveStatus");
      if (reviewStatus) reviewStatus.textContent = `Saved ${formatClockTime(new Date())}`;
    }
  } catch {
    const reviewStatus = document.getElementById("reviewSaveStatus");
    if (reviewStatus) reviewStatus.textContent = "Offline — grades will save when the server is back";
    scheduleMonthlyReviewSave(month);
  }
}

async function copyReviewTsv(month) {
  const escapeCell = (value) => {
    const text = String(value ?? "");
    return /[\t\n"]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const lines = reviewSheetRows(month).map((row) => row.cells.map(escapeCell).join("\t"));
  await copyText(lines.join("\n"));
  els.saveStatus.textContent = `Copied ${reviewMonthLabel(month)} review as TSV`;
}

async function downloadReviewXlsx(month) {
  try {
    const response = await fetch("/api/monthly-review/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        month,
        sheetName: new Date(`${month}-01T12:00:00`).toLocaleDateString("en-US", { month: "long" }),
        rows: reviewSheetRows(month)
      })
    });
    if (!response.ok) throw new Error("export failed");
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `monthly-review-${month}.xlsx`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 30_000);
    els.saveStatus.textContent = `Exported monthly-review-${month}.xlsx`;
  } catch {
    els.saveStatus.textContent = "Monthly review export failed";
  }
}

const REVIEW_TYPE_LABELS = { rule: "rule", daily: "daily", weekly: "weekly", monthly: "monthly", project: "project", outcome: "outcome" };

// Same focus-guard contract as renderLearnView(): without `force`, an unrelated
// render (the task poll, a save) must not rebuild the form under a half-typed
// Explain cell.
function renderMonthlyReviewView(force = false) {
  const container = els.reviewView;
  if (!container) return;
  if (!force && container.contains(document.activeElement)) return;
  container.innerHTML = "";

  if (!monthlyReviewsLoaded) {
    loadMonthlyReviews().then(() => {
      if (activeView === "review") renderMonthlyReviewView(true);
    });
  }

  const month = reviewMonth;
  const goals = reviewGoalsForMonth(month);

  const head = document.createElement("div");
  head.className = "review-head";
  const back = document.createElement("button");
  back.type = "button";
  back.className = "quiet";
  back.textContent = "‹";
  back.title = "Previous month";
  back.addEventListener("click", () => shiftReviewMonth(-1));
  const title = document.createElement("h2");
  title.textContent = `Monthly review — ${reviewMonthLabel(month)}`;
  const forward = document.createElement("button");
  forward.type = "button";
  forward.className = "quiet";
  forward.textContent = "›";
  forward.title = "Next month";
  forward.addEventListener("click", () => shiftReviewMonth(1));
  const graded = goals.filter((goal) => {
    const saved = reviewSavedRow(month, goal);
    return saved && saved.grade !== null && saved.grade !== undefined;
  }).length;
  const progress = document.createElement("span");
  progress.className = "review-progress";
  progress.textContent = `${graded} of ${goals.length} graded`;
  const status = document.createElement("span");
  status.className = "review-progress";
  status.id = "reviewSaveStatus";
  status.textContent = monthlyReviewsLoaded ? "" : "Loading saved grades…";
  const actions = document.createElement("div");
  actions.className = "review-actions";
  const tsvButton = document.createElement("button");
  tsvButton.type = "button";
  tsvButton.className = "quiet";
  tsvButton.textContent = "Copy TSV";
  tsvButton.title = "Copy the four-column sheet shape for pasting into the workbook";
  tsvButton.addEventListener("click", () => copyReviewTsv(month));
  const xlsxButton = document.createElement("button");
  xlsxButton.type = "button";
  xlsxButton.className = "quiet";
  xlsxButton.textContent = "Download .xlsx";
  xlsxButton.title = "Download this month as a one-sheet workbook in the check-in sheet's shape";
  xlsxButton.addEventListener("click", () => downloadReviewXlsx(month));
  actions.append(tsvButton, xlsxButton);
  head.append(back, title, forward, progress, status, actions);
  container.append(head);

  const prompt = document.createElement("p");
  prompt.className = "review-prompt";
  prompt.textContent =
    "For each goal, ask once: is this goal wrong, or am I? The most useful cell in the old workbook was the one where a goal got re-derived into a humane one, not the grade beside it.";
  container.append(prompt);

  const record = monthlyReviews.months?.[month];
  if (record?.imported === true) {
    // A month imported from the workbook renders in its own row order — the
    // goals it graded predate goals.json, so the current roster cannot lay it
    // out. Rows stay editable; edits save into the same record.
    let section = null;
    for (const row of record.rows || []) {
      if (row.header) {
        section = document.createElement("section");
        section.className = "review-category";
        const heading = document.createElement("h3");
        heading.textContent = row.title;
        section.append(heading);
        container.append(section);
        continue;
      }
      if (!section) {
        section = document.createElement("section");
        section.className = "review-category";
        container.append(section);
      }
      section.append(buildReviewImportedRow(month, row));
    }
    return;
  }

  if (!goals.length) {
    const empty = document.createElement("p");
    empty.className = "trends-empty";
    empty.textContent = "No goals were active in this month.";
    container.append(empty);
    return;
  }

  const categories = [];
  for (const goal of goals) {
    const category = String(goal.category || "OTHER");
    if (!categories.includes(category)) categories.push(category);
  }

  for (const category of categories) {
    const section = document.createElement("section");
    section.className = "review-category";
    const heading = document.createElement("h3");
    heading.textContent = category;
    section.append(heading);
    for (const goal of goals) {
      if (String(goal.category || "OTHER") !== category) continue;
      section.append(buildReviewGoalRow(month, goal));
    }
    container.append(section);
  }

  const extras = reviewUnmatchedRows(month, goals);
  if (extras.length) {
    const section = document.createElement("section");
    section.className = "review-category";
    const heading = document.createElement("h3");
    heading.textContent = "OTHER (imported rows)";
    section.append(heading);
    for (const row of extras) section.append(buildReviewImportedRow(month, row));
    container.append(section);
  }
}

// A row bound straight to a saved record row (imported months, unmatched rows).
// No evidence line: nothing in the app tracked these days.
function buildReviewImportedRow(month, savedRow) {
  const row = document.createElement("div");
  row.className = "review-row";

  const info = document.createElement("div");
  info.className = "review-row-info";
  const title = document.createElement("div");
  title.className = "review-row-title";
  title.textContent = savedRow.title;
  info.append(title);

  const grade = document.createElement("select");
  grade.className = "review-grade";
  grade.title = "How well did I do? (−5..+5)";
  const blank = document.createElement("option");
  blank.value = "";
  blank.textContent = "—";
  grade.append(blank);
  for (let value = 5; value >= -5; value -= 1) {
    const option = document.createElement("option");
    option.value = String(value);
    option.textContent = value > 0 ? `+${value}` : String(value);
    grade.append(option);
  }
  // The workbook holds fractional grades ("5.0 in Feb", a 2.5 here and there);
  // an integer-only select would blank them on sight, so the exact value gets
  // its own option rather than being rounded or dropped.
  if (savedRow.grade !== null && savedRow.grade !== undefined && !Number.isInteger(savedRow.grade)) {
    const exact = document.createElement("option");
    exact.value = String(savedRow.grade);
    exact.textContent = savedRow.grade > 0 ? `+${savedRow.grade}` : String(savedRow.grade);
    grade.append(exact);
  }
  grade.value = savedRow.grade === null || savedRow.grade === undefined ? "" : String(savedRow.grade);
  grade.addEventListener("change", () => {
    savedRow.grade = grade.value === "" ? null : Number(grade.value);
    scheduleMonthlyReviewSave(month);
  });

  const explain = document.createElement("textarea");
  explain.className = "review-text";
  explain.placeholder = "Explain";
  explain.value = savedRow.explain || "";
  explain.addEventListener("change", () => {
    savedRow.explain = explain.value;
    scheduleMonthlyReviewSave(month);
  });

  const change = document.createElement("textarea");
  change.className = "review-text";
  change.placeholder = "How should I change it for this next month?";
  change.value = savedRow.change || "";
  change.addEventListener("change", () => {
    savedRow.change = change.value;
    scheduleMonthlyReviewSave(month);
  });

  row.append(info, grade, explain, change);
  return row;
}

function buildReviewGoalRow(month, goal) {
  const saved = reviewSavedRow(month, goal);
  const row = document.createElement("div");
  row.className = "review-row";
  if (goal.archived) row.classList.add("is-archived");

  const info = document.createElement("div");
  info.className = "review-row-info";
  const title = document.createElement("div");
  title.className = "review-row-title";
  title.textContent = goal.title;
  const meta = document.createElement("div");
  meta.className = "review-row-meta";
  const type = document.createElement("span");
  type.className = "review-type-chip";
  type.textContent = REVIEW_TYPE_LABELS[goal.type] || goal.type || "goal";
  meta.append(type);
  if (goal.archived) {
    const archived = document.createElement("span");
    archived.className = "review-type-chip is-archived";
    archived.textContent = "archived";
    meta.append(archived);
  }
  const evidence = document.createElement("span");
  evidence.className = "review-evidence";
  evidence.textContent = reviewEvidenceText(goal, month);
  meta.append(evidence);
  const past = reviewPastGrades(goal, month);
  if (past) {
    const chip = document.createElement("span");
    chip.className = "review-past-grades";
    chip.textContent = past;
    chip.title = "Grades from earlier monthly reviews";
    meta.append(chip);
  }
  info.append(title, meta);

  const grade = document.createElement("select");
  grade.className = "review-grade";
  grade.title = "How well did I do? (−5..+5)";
  const blank = document.createElement("option");
  blank.value = "";
  blank.textContent = "—";
  grade.append(blank);
  for (let value = 5; value >= -5; value -= 1) {
    const option = document.createElement("option");
    option.value = String(value);
    option.textContent = value > 0 ? `+${value}` : String(value);
    grade.append(option);
  }
  grade.value = saved && saved.grade !== null && saved.grade !== undefined ? String(saved.grade) : "";
  grade.addEventListener("change", () => {
    reviewSetAnswer(month, goal, "grade", grade.value === "" ? null : Number(grade.value));
    const progress = els.reviewView.querySelector(".review-progress");
    if (progress) {
      const goals = reviewGoalsForMonth(month);
      const graded = goals.filter((item) => {
        const record = reviewSavedRow(month, item);
        return record && record.grade !== null && record.grade !== undefined;
      }).length;
      progress.textContent = `${graded} of ${goals.length} graded`;
    }
  });

  const explain = document.createElement("textarea");
  explain.className = "review-text";
  explain.placeholder = "Explain";
  explain.value = saved?.explain || "";
  explain.addEventListener("change", () => reviewSetAnswer(month, goal, "explain", explain.value));

  const change = document.createElement("textarea");
  change.className = "review-text";
  change.placeholder = "How should I change it for this next month?";
  change.value = saved?.change || "";
  change.addEventListener("change", () => reviewSetAnswer(month, goal, "change", change.value));

  row.append(info, grade, explain, change);
  return row;
}

// ---------------------------------------------------------------------------
// Document view formatting (the rich editor behind the Document tab).
//
// entry.journalHtml is what the editor loads and saves. entry.journal is a
// plain-text mirror rebuilt from the DOM on every edit, so hour extraction,
// search, the Missing tab, the workbook TSV and everything else downstream keep
// reading the same flat string they always did and need to know nothing about
// markup. Never write entry.journal from anywhere but the mirror.
//
// Undo is our own snapshot stack. Several commands here (block styles, tables,
// condense) mutate the DOM directly, which invalidates the browser's own
// contenteditable undo transactions, so Ctrl+Z/Ctrl+Y are intercepted inside the
// editor and never reach the browser. handleGlobalUndo() must keep ignoring
// events from inside a contenteditable or app-wide undo would fire instead.
//
// Font family is deliberately absent. The user asked for Google-Docs-grade
// formatting minus font choice, so the surface keeps one typeface and the size
// ladder is in points to match how debate cards and Word documents are talked
// about.
// ---------------------------------------------------------------------------

// Verbatim's card hierarchy is Pocket > Hat > Block > Tag; the h1..h4 mapping
// keeps them real headings for exports and accessibility.
const DOC_BLOCK_STYLES = [
  { key: "body", label: "Card body", title: "Normal card text", tag: "p", className: "" },
  { key: "analytic", label: "Analytic", title: "Analytic / your own argument", tag: "p", className: "doc-analytic" },
  { key: "pocket", label: "Pocket", title: "Pocket (heading 1)", tag: "h1", className: "doc-pocket" },
  { key: "hat", label: "Hat", title: "Hat (heading 2)", tag: "h2", className: "doc-hat" },
  { key: "block", label: "Block", title: "Block (heading 3)", tag: "h3", className: "doc-block" },
  { key: "tag", label: "Tag", title: "Tag (heading 4)", tag: "h4", className: "doc-tag" },
  { key: "cite", label: "Cite", title: "Cite line", tag: "p", className: "doc-cite" },
  { key: "quote", label: "Quote", title: "Block quote", tag: "blockquote", className: "" },
  { key: "code", label: "Code", title: "Monospaced block", tag: "pre", className: "" }
];
const DOC_FONT_SIZES = [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];
const DOC_BASE_POINT_SIZE = 12;
const DOC_HIGHLIGHTS = [
  { label: "Yellow", value: "#fff275" },
  { label: "Green", value: "#a5efa0" },
  { label: "Cyan", value: "#9ce4ff" },
  { label: "Pink", value: "#ffb0cf" },
  { label: "Orange", value: "#ffcd8c" },
  { label: "Lilac", value: "#d8c2ff" }
];
const DOC_TEXT_COLORS = [
  { label: "Default", value: "" },
  { label: "Red", value: "#b42318" },
  { label: "Orange", value: "#a8590a" },
  { label: "Green", value: "#2b7a42" },
  { label: "Blue", value: "#1d4ed8" },
  { label: "Purple", value: "#6d5a9f" },
  { label: "Grey", value: "#657072" }
];
const DOC_LINE_SPACINGS = [
  { label: "Single", value: "" },
  { label: "1.15", value: "1.15" },
  { label: "1.5", value: "1.5" },
  { label: "Double", value: "2" }
];
const DOC_BLOCK_SELECTOR = "p, div, h1, h2, h3, h4, h5, h6, li, blockquote, pre";
const DOC_TOP_BLOCK_SELECTOR = `${DOC_BLOCK_SELECTOR}, ul, ol, table, hr`;
const DOC_LINE_TAGS = new Set(["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "BLOCKQUOTE", "PRE", "TR", "CAPTION"]);
const DOC_ALLOWED_TAGS = new Set([
  "P", "BR", "DIV", "SPAN", "B", "STRONG", "I", "EM", "U", "S", "MARK", "SUB", "SUP", "CODE",
  "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "LI", "BLOCKQUOTE", "PRE", "HR", "A", "IMG",
  "TABLE", "THEAD", "TBODY", "TFOOT", "TR", "TH", "TD", "CAPTION"
]);
// The only place a document image may point: files the server stored under
// entries/media/ (uploaded via paste/drop/the toolbar button). A remote URL
// would break offline and quietly leak reads to the wider internet, and a
// data: URI would balloon every entry save, history snapshot and backup the
// day owns — so both are stripped rather than kept.
const DOC_IMAGE_SRC_PATTERN = /^\/?entries\/media\//;
const DOC_TAG_REPLACEMENTS = { STRIKE: "S", DEL: "S", CITE: "EM", BIG: "SPAN", SMALL: "SPAN", FONT: "SPAN", ABBR: "SPAN", LABEL: "SPAN" };
const DOC_ALLOWED_CLASSES = new Set([
  "doc-analytic", "doc-pocket", "doc-hat", "doc-block", "doc-tag", "doc-cite", "doc-emphasis", "doc-mark", "doc-table"
]);
// No font-family, by design: the Document view offers size, weight, colour and
// highlighting but never a typeface, so a pasted font is dropped rather than
// smuggled in. "background" is here because Word and Google Docs write the
// shorthand for highlighting; url() values are rejected further down.
const DOC_ALLOWED_STYLES = new Set([
  "color", "background", "background-color", "font-size", "font-weight", "font-style",
  "text-decoration", "text-decoration-line", "text-align", "line-height", "vertical-align"
]);
const DOC_HISTORY_LIMIT = 150;
const DOC_SNAPSHOT_IDLE_MS = 700;

let docLoadedDate = null;
let docUndoStack = [];
let docRedoStack = [];
let docLastSnapshotAt = 0;
let docApplyingHistory = false;
let docToolbarBuilt = false;
let docUnderlineMode = false;
let docHighlightMode = false;
let docHighlightColor = DOC_HIGHLIGHTS[0].value;
let docSavedRange = null;
let docOpenMenu = null;
let docToolbarStatePending = false;

function wireDocumentEditor() {
  const doc = els.journalDoc;
  if (!doc) return;
  buildDocToolbar();
  try {
    document.execCommand("defaultParagraphSeparator", false, "p");
  } catch {
    // Older engines keep their own separator; docNormalize() cleans up after them.
  }
  doc.addEventListener("beforeinput", handleDocBeforeInput);
  doc.addEventListener("input", handleDocInput);
  doc.addEventListener("keydown", handleDocKeydown);
  doc.addEventListener("paste", handleDocPaste);
  doc.addEventListener("dragover", handleDocDragOver);
  doc.addEventListener("drop", handleDocDrop);
  doc.addEventListener("mouseup", handleDocSelectionGesture);
  doc.addEventListener("keyup", scheduleDocToolbarState);
  doc.addEventListener("blur", () => docRememberSelection());
  document.addEventListener("selectionchange", () => {
    if (!docSelectionInside()) return;
    docRememberSelection();
    scheduleDocToolbarState();
  });
  document.addEventListener("pointerdown", handleDocMenuOutsidePointer, true);
}

function handleDocInput() {
  if (docApplyingHistory) return;
  docNormalize();
  docChanged();
}

// Snapshots are taken before the change lands, and runs of ordinary typing
// coalesce into one so Ctrl+Z steps back by phrases rather than by letters.
function handleDocBeforeInput(event) {
  if (docApplyingHistory) return;
  const coalescing = ["insertText", "deleteContentBackward", "deleteContentForward"].includes(event.inputType);
  if (!coalescing || Date.now() - docLastSnapshotAt > DOC_SNAPSHOT_IDLE_MS) docPushHistory();
  docLastSnapshotAt = Date.now();
}

function handleDocKeydown(event) {
  const mod = event.ctrlKey || event.metaKey;
  const key = event.key.toLowerCase();
  if (mod && key === "z" && !event.shiftKey) return docShortcut(event, docUndo);
  if (mod && (key === "y" || (key === "z" && event.shiftKey))) return docShortcut(event, docRedo);
  if (mod && event.altKey && /^[0-4]$/.test(event.key)) {
    const keys = ["body", "pocket", "hat", "block", "tag"];
    return docShortcut(event, () => applyDocBlockStyle(keys[Number(event.key)]));
  }
  if (mod && !event.altKey) {
    if (!event.shiftKey && key === "b") return docShortcut(event, () => docInlineCommand("bold"));
    if (!event.shiftKey && key === "i") return docShortcut(event, () => docInlineCommand("italic"));
    if (!event.shiftKey && key === "u") return docShortcut(event, () => docInlineCommand("underline"));
    if (!event.shiftKey && key === "k") return docShortcut(event, promptDocLink);
    if (event.shiftKey && key === "x") return docShortcut(event, () => docInlineCommand("strikeThrough"));
    if (event.shiftKey && event.code === "Digit7") return docShortcut(event, () => docInlineCommand("insertOrderedList"));
    if (event.shiftKey && event.code === "Digit8") return docShortcut(event, () => docInlineCommand("insertUnorderedList"));
    if (event.shiftKey && key === "l") return docShortcut(event, () => docInlineCommand("justifyLeft"));
    if (event.shiftKey && key === "e") return docShortcut(event, () => docInlineCommand("justifyCenter"));
    if (event.shiftKey && key === "r") return docShortcut(event, () => docInlineCommand("justifyRight"));
    if (event.shiftKey && key === "j") return docShortcut(event, () => docInlineCommand("justifyFull"));
    if (event.shiftKey && key === "h") return docShortcut(event, () => applyDocHighlight(docHighlightColor));
    if (!event.shiftKey && event.code === "Comma") return docShortcut(event, () => stepDocFontSize(-1));
    if (!event.shiftKey && event.code === "Period") return docShortcut(event, () => stepDocFontSize(1));
    if (!event.shiftKey && event.code === "Digit8") return docShortcut(event, shrinkDocSelection);
    if (!event.shiftKey && key === "\\") return docShortcut(event, () => clearDocFormatting());
  }
  // Verbatim's function keys. F12 usually belongs to the browser's devtools and
  // cannot be cancelled, which is why Ctrl+\ is also bound to clear formatting.
  if (event.key === "F9" && !mod) return docShortcut(event, toggleDocUnderlineMode);
  if (event.key === "F10" && !mod) return docShortcut(event, applyDocEmphasis);
  if (event.key === "F11" && !mod) return docShortcut(event, () => applyDocHighlight(docHighlightColor));
  if (event.key === "F3" && !mod) return docShortcut(event, () => condenseDocSelection(" "));
  if (event.key === "F12" && !mod) return docShortcut(event, () => clearDocFormatting());
  if (event.key === "Tab") return handleDocTab(event);
  return undefined;
}

function docShortcut(event, action) {
  event.preventDefault();
  event.stopPropagation();
  action();
}

function handleDocTab(event) {
  const cell = docCurrentCell();
  if (cell) {
    event.preventDefault();
    moveDocCell(cell, event.shiftKey ? -1 : 1);
    return;
  }
  event.preventDefault();
  docInlineCommand(event.shiftKey ? "outdent" : "indent");
}

// Underline/highlight mode: select text and it is marked immediately, which is
// how card cutting actually goes. The selection collapses afterwards so the same
// gesture cannot toggle itself back off. Mouse only -- firing on keyup would
// collapse a shift+arrow selection while it was still being extended.
function handleDocSelectionGesture() {
  if (!docUnderlineMode && !docHighlightMode) return;
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || !docSelectionInside()) return;
  if (docUnderlineMode) {
    docPushHistory();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand("underline");
    docChanged();
  }
  if (docHighlightMode) applyDocHighlight(docHighlightColor);
  const range = window.getSelection()?.rangeCount ? window.getSelection().getRangeAt(0) : null;
  if (range) {
    range.collapse(false);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  }
}

function handleDocPaste(event) {
  const clipboard = event.clipboardData;
  if (!clipboard) return;
  event.preventDefault();
  // A pasted screenshot or photo arrives as a file, not markup. Uploaded to the
  // server's media store and inserted by URL — never inlined as a data: URI,
  // which the sanitizer would (rightly) strip on the next load anyway.
  const imageFiles = [...(clipboard.files || [])].filter((file) => /^image\//.test(file.type || ""));
  if (imageFiles.length) {
    insertDocImageFiles(imageFiles);
    return;
  }
  const html = clipboard.getData("text/html");
  const text = clipboard.getData("text/plain");
  docPushHistory();
  if (html) document.execCommand("insertHTML", false, sanitizeDocHtml(html));
  else document.execCommand("insertText", false, text);
  docNormalize();
  docChanged();
}

// Dragging a picture in from Explorer or the phone's photo picker sheet.
function handleDocDragOver(event) {
  if ([...(event.dataTransfer?.types || [])].includes("Files")) event.preventDefault();
}

function handleDocDrop(event) {
  const files = [...(event.dataTransfer?.files || [])].filter((file) => /^image\//.test(file.type || ""));
  if (!files.length) return;
  event.preventDefault();
  insertDocImageFiles(files);
}

/* --- Pictures in the document ------------------------------------------------

   Upload path: downscale on the client (a phone photo is 4-12 MB and the
   server's picture endpoint caps at 4 MB; nothing in a journal needs more than
   ~1800 px), POST to /api/survey-image with questionId "doc" — the same store
   and endpoint the night survey's picture questions already use, so the server
   needed no new code — then insert <img src="/entries/media/..."> at the caret.
   The sanitizer only admits that path (see DOC_IMAGE_SRC_PATTERN).
--------------------------------------------------------------------------- */

const DOC_IMAGE_MAX_DIMENSION = 1800;
// Small PNGs skip re-encoding so screenshots keep sharp text and transparency.
const DOC_IMAGE_PNG_KEEP_BYTES = 1_500_000;

async function docImageDataUrl(file) {
  const readAsDataUrl = () =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  let bitmap = null;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return readAsDataUrl();
  }
  const scale = Math.min(1, DOC_IMAGE_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.type === "image/png" && file.size <= DOC_IMAGE_PNG_KEEP_BYTES) {
    bitmap.close();
    return readAsDataUrl();
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}

async function insertDocImageFiles(files) {
  const date = state.currentDate;
  for (const file of files) {
    els.saveStatus.textContent = "Uploading picture…";
    try {
      const dataUrl = await docImageDataUrl(file);
      const response = await fetch("/api/survey-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, questionId: "doc", dataUrl })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.url) throw new Error(result.error || "upload failed");
      // The day may have changed while the upload ran; insert only into the
      // document the picture was pasted into.
      if (state.currentDate !== date) {
        els.saveStatus.textContent = "Picture stored, but the day changed — paste it again on the right day";
        continue;
      }
      docFocusEditor();
      docPushHistory();
      document.execCommand("insertHTML", false, `<img src="${result.url}" alt="">`);
      docNormalize();
      docChanged();
      els.saveStatus.textContent = `Saved picture ${formatClockTime(new Date())}`;
    } catch {
      els.saveStatus.textContent = "Picture upload failed";
    }
  }
}

function promptDocImage() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.multiple = true;
  input.addEventListener("change", () => {
    if (input.files?.length) insertDocImageFiles([...input.files]);
  });
  input.click();
}

function handleDocMenuOutsidePointer(event) {
  if (!docOpenMenu) return;
  if (docOpenMenu.contains(event.target) || docOpenMenu.docOwner?.contains(event.target)) return;
  closeDocMenu();
}

// ---------------------------------------------------------------------------
// Loading and saving
// ---------------------------------------------------------------------------

function entryDocHtml(entry) {
  const html = typeof entry?.journalHtml === "string" ? entry.journalHtml : "";
  if (html.trim()) return html;
  return docHtmlFromPlainText(entry?.journal || "");
}

function renderDocumentEditor(entry) {
  const doc = els.journalDoc;
  if (!doc) return;
  const html = sanitizeDocHtml(entryDocHtml(entry)) || "<p><br></p>";
  const sameDay = docLoadedDate === entry.date;
  // Reloading under the caret would throw away the cursor mid-sentence, and the
  // editor is the newer copy of anything it holds while focused.
  if (sameDay && (html === doc.innerHTML || doc.contains(document.activeElement))) {
    scheduleDocToolbarState();
    return;
  }
  doc.innerHTML = html;
  docLoadedDate = entry.date;
  if (!sameDay) {
    docUndoStack = [];
    docRedoStack = [];
  }
  docNormalize();
  scheduleDocToolbarState();
}

function docChanged() {
  const doc = els.journalDoc;
  const entry = currentEntry();
  entry.journalHtml = doc.innerHTML;
  entry.journal = docPlainText(doc);
  docLoadedDate = entry.date;
  scheduleDocToolbarState();
  renderSearchResults();
  renderMissingOutput();
  debouncedSave();
}

// ---------------------------------------------------------------------------
// Undo/redo
// ---------------------------------------------------------------------------

function docSnapshot() {
  return { html: els.journalDoc.innerHTML, selection: docSelectionState() };
}

function docPushHistory() {
  if (docApplyingHistory) return;
  const snapshot = docSnapshot();
  const top = docUndoStack[docUndoStack.length - 1];
  docLastSnapshotAt = Date.now();
  if (top && top.html === snapshot.html) {
    top.selection = snapshot.selection;
    return;
  }
  docUndoStack.push(snapshot);
  if (docUndoStack.length > DOC_HISTORY_LIMIT) docUndoStack.shift();
  docRedoStack = [];
}

function docUndo() {
  const current = docSnapshot();
  while (docUndoStack.length && docUndoStack[docUndoStack.length - 1].html === current.html) docUndoStack.pop();
  if (!docUndoStack.length) return;
  docRedoStack.push(current);
  docApplySnapshot(docUndoStack.pop());
}

function docRedo() {
  if (!docRedoStack.length) return;
  docUndoStack.push(docSnapshot());
  docApplySnapshot(docRedoStack.pop());
}

function docApplySnapshot(snapshot) {
  docApplyingHistory = true;
  els.journalDoc.innerHTML = snapshot.html;
  docRestoreSelectionState(snapshot.selection);
  docApplyingHistory = false;
  docChanged();
}

// Node paths, not text offsets: the snapshot restores byte-identical markup, so
// a child-index path lands the caret exactly where it was, including inside an
// empty paragraph or table cell where a character offset would be ambiguous.
function docSelectionState() {
  const selection = window.getSelection();
  if (!selection?.rangeCount) return null;
  const range = selection.getRangeAt(0);
  if (!els.journalDoc.contains(range.startContainer) || !els.journalDoc.contains(range.endContainer)) return null;
  return {
    start: docNodePath(range.startContainer),
    startOffset: range.startOffset,
    end: docNodePath(range.endContainer),
    endOffset: range.endOffset
  };
}

function docRestoreSelectionState(state) {
  if (!state) return;
  const start = docNodeFromPath(state.start);
  const end = docNodeFromPath(state.end);
  if (!start || !end) return;
  try {
    const range = document.createRange();
    range.setStart(start, Math.min(state.startOffset, docNodeLength(start)));
    range.setEnd(end, Math.min(state.endOffset, docNodeLength(end)));
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  } catch {
    // A path that no longer resolves just leaves the caret where the browser put it.
  }
}

function docNodeLength(node) {
  return node.nodeType === Node.TEXT_NODE ? node.nodeValue.length : node.childNodes.length;
}

function docNodePath(node) {
  const path = [];
  let current = node;
  while (current && current !== els.journalDoc) {
    const parent = current.parentNode;
    if (!parent) return path;
    path.unshift([...parent.childNodes].indexOf(current));
    current = parent;
  }
  return path;
}

function docNodeFromPath(path) {
  let node = els.journalDoc;
  for (const index of path || []) {
    if (!node.childNodes[index]) return null;
    node = node.childNodes[index];
  }
  return node;
}

// ---------------------------------------------------------------------------
// Selection plumbing
// ---------------------------------------------------------------------------

function docSelectionInside() {
  const selection = window.getSelection();
  if (!selection?.rangeCount) return false;
  return els.journalDoc.contains(selection.getRangeAt(0).commonAncestorContainer);
}

function docRememberSelection() {
  const selection = window.getSelection();
  if (!selection?.rangeCount) return;
  const range = selection.getRangeAt(0);
  if (els.journalDoc.contains(range.commonAncestorContainer)) docSavedRange = range.cloneRange();
}

// Toolbar controls run after focus has already left the editor, so every command
// starts by putting the selection back where the user left it.
function docFocusEditor() {
  const doc = els.journalDoc;
  if (docSelectionInside()) {
    doc.focus({ preventScroll: true });
    return;
  }
  doc.focus({ preventScroll: true });
  const selection = window.getSelection();
  if (docSavedRange && doc.contains(docSavedRange.commonAncestorContainer)) {
    selection.removeAllRanges();
    selection.addRange(docSavedRange);
    return;
  }
  const range = document.createRange();
  range.selectNodeContents(doc);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function docRange() {
  const selection = window.getSelection();
  return selection?.rangeCount ? selection.getRangeAt(0) : null;
}

// Clicking inside a word and hitting highlight should mark that word; Google
// Docs' "applies to nothing" behaviour reads as a broken button here. Returns
// whether there is now something to format.
function docExpandToWord() {
  const selection = window.getSelection();
  if (!selection?.rangeCount) return false;
  if (!selection.isCollapsed) return true;
  const range = selection.getRangeAt(0);
  const node = range.startContainer;
  if (node.nodeType !== Node.TEXT_NODE) return false;
  const text = node.nodeValue || "";
  let start = range.startOffset;
  let end = range.startOffset;
  while (start > 0 && /\S/.test(text[start - 1])) start -= 1;
  while (end < text.length && /\S/.test(text[end])) end += 1;
  if (start === end) return false;
  const word = document.createRange();
  word.setStart(node, start);
  word.setEnd(node, end);
  selection.removeAllRanges();
  selection.addRange(word);
  return true;
}

function docCurrentBlock() {
  const range = docRange();
  if (!range) return null;
  const node = range.startContainer;
  const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  return element?.closest(DOC_BLOCK_SELECTOR) || null;
}

function docCurrentTopBlock() {
  const range = docRange();
  if (!range) return null;
  let node = range.startContainer;
  while (node && node.parentNode !== els.journalDoc) node = node.parentNode;
  return node && node.nodeType === Node.ELEMENT_NODE ? node : null;
}

function docCurrentCell() {
  const range = docRange();
  if (!range || !els.journalDoc.contains(range.startContainer)) return null;
  const node = range.startContainer;
  const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  if (!element) return null;
  // A structural edit can collapse the selection onto the row or the table
  // itself; that still counts as being in a table, so fall back to a real cell
  // instead of reporting "not in a table".
  return element.closest("td, th")
    || element.closest("tr")?.firstElementChild
    || element.closest("table")?.querySelector("td, th")
    || null;
}

function docSelectedBlocks() {
  const range = docRange();
  if (!range) return [];
  const blocks = [...els.journalDoc.querySelectorAll(DOC_BLOCK_SELECTOR)].filter((block) => {
    if (block.querySelector(DOC_BLOCK_SELECTOR)) return false;
    return range.intersectsNode(block);
  });
  if (blocks.length) return blocks;
  const single = docCurrentBlock();
  return single ? [single] : [];
}

function docPlaceCaret(node, atEnd = false) {
  if (!node) return;
  const range = document.createRange();
  range.selectNodeContents(node);
  range.collapse(!atEnd);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

function docCommand(run) {
  docFocusEditor();
  docPushHistory();
  document.execCommand("styleWithCSS", false, "true");
  run();
  docNormalize();
  docChanged();
}

function docInlineCommand(command, value = null) {
  docCommand(() => document.execCommand(command, false, value));
}

// execCommand has no "wrap the selection in my own element", so this borrows the
// one command that reliably marks every run in a selection -- legacy fontSize --
// and swaps the <font> tags it leaves behind for spans we control. `decorate`
// runs with the span already in the document (so computed styles are readable)
// and may return a different element to stand in for it.
function docWrapSelection(decorate) {
  document.execCommand("styleWithCSS", false, "false");
  document.execCommand("fontSize", false, "7");
  document.execCommand("styleWithCSS", false, "true");
  const marked = [...els.journalDoc.querySelectorAll('font[size="7"], span[style*="xx-large"]')];
  const spans = [];
  for (const found of marked) {
    const span = document.createElement("span");
    while (found.firstChild) span.append(found.firstChild);
    found.replaceWith(span);
    spans.push(span);
  }
  const kept = [];
  for (const span of spans) {
    const result = decorate(span);
    const node = result instanceof Node ? result : span;
    if (node.isConnected) kept.push(node);
  }
  if (kept.length) {
    const range = document.createRange();
    range.setStartBefore(kept[0]);
    range.setEndAfter(kept[kept.length - 1]);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
  return kept;
}

function applyDocBlockStyle(key) {
  const style = DOC_BLOCK_STYLES.find((option) => option.key === key);
  if (!style) return;
  docCommand(() => {
    const rewritten = [];
    for (const block of docSelectedBlocks()) {
      if (block.tagName === "LI") {
        block.className = style.className;
        rewritten.push(block);
        continue;
      }
      const replacement = document.createElement(style.tag);
      // Moving the children keeps the live text nodes, so nothing has to be
      // re-created; the range is rebuilt below because its endpoints were the
      // old block itself, which is now detached.
      while (block.firstChild) replacement.append(block.firstChild);
      if (style.className) replacement.className = style.className;
      if (block.style.textAlign) replacement.style.textAlign = block.style.textAlign;
      if (block.style.lineHeight) replacement.style.lineHeight = block.style.lineHeight;
      block.replaceWith(replacement);
      rewritten.push(replacement);
    }
    if (!rewritten.length) return;
    const range = document.createRange();
    range.setStart(rewritten[0], 0);
    range.setEnd(rewritten[rewritten.length - 1], rewritten[rewritten.length - 1].childNodes.length);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  });
}

function applyDocFontSize(points) {
  docCommand(() => {
    if (!docExpandToWord()) return;
    docWrapSelection((span) => {
      span.style.fontSize = `${points}pt`;
    });
  });
}

function stepDocFontSize(direction) {
  const current = docCurrentPointSize();
  const index = DOC_FONT_SIZES.findIndex((size) => size >= current);
  const base = index === -1 ? DOC_FONT_SIZES.length - 1 : index;
  const next = DOC_FONT_SIZES[Math.min(DOC_FONT_SIZES.length - 1, Math.max(0, base + direction))];
  applyDocFontSize(next);
}

// Descends into the node the range actually starts at. A range whose start is an
// element with an offset (select-all, triple click, or the re-selection after a
// wrap) would otherwise report the containing block's size and lose whatever
// size the run itself carries.
function docCurrentPointSize() {
  const range = docRange();
  if (!range) return DOC_BASE_POINT_SIZE;
  let node = range.startContainer;
  if (node.nodeType === Node.ELEMENT_NODE) node = node.childNodes[range.startOffset] || node.firstChild || node;
  const element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
  if (!element || !els.journalDoc.contains(element)) return DOC_BASE_POINT_SIZE;
  return docPointSizeOf(element);
}

function docPointSizeOf(element) {
  const pixels = parseFloat(window.getComputedStyle(element).fontSize);
  if (!Number.isFinite(pixels)) return DOC_BASE_POINT_SIZE;
  return Math.round(pixels * 0.75 * 2) / 2;
}

function applyDocHighlight(color) {
  docCommand(() => {
    if (!docExpandToWord()) return;
    docWrapSelection((span) => {
      // <mark> rather than a bare background so night mode can force dark ink on
      // these pastels without guessing which spans are highlights.
      const mark = document.createElement("mark");
      mark.className = "doc-mark";
      mark.style.backgroundColor = color;
      while (span.firstChild) mark.append(span.firstChild);
      span.replaceWith(mark);
      return mark;
    });
  });
}

function removeDocHighlight() {
  docCommand(() => {
    if (!docExpandToWord()) return;
    docWrapSelection((span) => {
      for (const mark of [...span.querySelectorAll("mark")]) docUnwrap(mark);
      const parentMark = span.closest("mark");
      if (parentMark) docSplitOutOfMark(span, parentMark);
      docUnwrap(span);
    });
  });
}

// A highlight the selection sits inside has to be cut into before/after halves,
// otherwise unhighlighting part of a run silently does nothing.
function docSplitOutOfMark(span, mark) {
  const before = mark.cloneNode(false);
  const after = mark.cloneNode(false);
  let node = mark.firstChild;
  let seen = false;
  while (node) {
    const next = node.nextSibling;
    if (node === span) seen = true;
    else (seen ? after : before).append(node);
    node = next;
  }
  if (before.childNodes.length) mark.before(before);
  mark.before(span);
  if (after.childNodes.length) mark.after(after);
  mark.remove();
}

function applyDocTextColor(color) {
  docCommand(() => {
    if (!docExpandToWord()) return;
    docWrapSelection((span) => {
      span.style.color = color;
      if (!color) span.style.removeProperty("color");
    });
  });
}

function applyDocEmphasis() {
  docCommand(() => {
    if (!docExpandToWord()) return;
    docWrapSelection((span) => {
      if (span.classList.contains("doc-emphasis")) docUnwrap(span);
      else span.className = "doc-emphasis";
    });
  });
}

function applyDocLineSpacing(value) {
  docCommand(() => {
    for (const block of docSelectedBlocks()) {
      if (value) block.style.lineHeight = value;
      else block.style.removeProperty("line-height");
    }
  });
}

// Verbatim's shrink: everything in the selection gets smaller except what is
// underlined, so the parts you actually read stay legible while the rest of the
// card compresses. Repeat presses keep stepping down.
function shrinkDocSelection() {
  docCommand(() => {
    if (!docExpandToWord()) return;
    // Measured before the wrap: applying fontSize drops any size already on the
    // run, so reading it off the new wrapper would see the block's size instead
    // and every press would restart from 12pt.
    const base = docCurrentPointSize();
    const smaller = [...DOC_FONT_SIZES].reverse().find((size) => size < base) || DOC_FONT_SIZES[0];
    docWrapSelection((span) => {
      for (const kept of span.querySelectorAll("u, [style*='underline']")) {
        if (!kept.style.fontSize) kept.style.fontSize = `${base}pt`;
      }
      span.style.fontSize = `${smaller}pt`;
    });
  });
}

function resetDocFontSize() {
  docCommand(() => {
    if (!docExpandToWord()) return;
    docWrapSelection((span) => {
      for (const sized of [...span.querySelectorAll("[style*='font-size']")]) sized.style.removeProperty("font-size");
      docUnwrap(span);
    });
  });
}

// Condense joins the selected paragraphs into one and collapses runs of
// whitespace, keeping inline formatting. The pilcrow variant leaves a visible
// mark where each paragraph break used to be.
function condenseDocSelection(separator) {
  docCommand(() => {
    const range = docRange();
    if (!range || range.collapsed) return;
    const holder = document.createElement("div");
    holder.append(range.extractContents());
    let guard = 0;
    while (guard < 500) {
      guard += 1;
      const block = holder.querySelector(`${DOC_BLOCK_SELECTOR}, ul, ol, table, tbody, tr, td, th`);
      if (!block) break;
      if (block.previousSibling || block.parentNode !== holder) block.before(document.createTextNode(separator));
      docUnwrap(block);
    }
    for (const node of docTextNodes(holder)) node.nodeValue = node.nodeValue.replace(/\s+/g, " ");
    for (const br of [...holder.querySelectorAll("br")]) br.replaceWith(document.createTextNode(" "));
    const fragment = document.createDocumentFragment();
    while (holder.firstChild) fragment.append(holder.firstChild);
    const last = fragment.lastChild;
    range.insertNode(fragment);
    if (last) {
      const after = document.createRange();
      after.setStartAfter(last);
      after.collapse(true);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(after);
    }
  });
}

// Verbatim's clear-formatting keeps highlighting, because stripping a card's
// formatting is usually about undoing sizes and bolds, not about losing the read
// markings. clearDocFormatting({ all: true }) is the no-mercy version.
function clearDocFormatting(options = {}) {
  docCommand(() => {
    const range = docRange();
    if (!range || range.collapsed) return;
    const holder = document.createElement("div");
    holder.append(range.extractContents());
    docStripFormatting(holder, !options.all);
    const fragment = document.createDocumentFragment();
    while (holder.firstChild) fragment.append(holder.firstChild);
    const last = fragment.lastChild;
    range.insertNode(fragment);
    if (last) {
      const after = document.createRange();
      after.setStartAfter(last);
      after.collapse(true);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(after);
    }
  });
}

function docStripFormatting(node, keepHighlight) {
  for (const child of [...node.childNodes]) {
    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    docStripFormatting(child, keepHighlight);
    if (child.tagName === "BR" || child.tagName === "HR") continue;
    if (child.matches(`${DOC_BLOCK_SELECTOR}, ul, ol, table, thead, tbody, tfoot, tr, td, th, caption`)) {
      child.removeAttribute("style");
      child.removeAttribute("class");
      continue;
    }
    const highlight = docHighlightOf(child);
    if (keepHighlight && highlight) {
      const mark = document.createElement("mark");
      mark.className = "doc-mark";
      mark.style.backgroundColor = highlight;
      while (child.firstChild) mark.append(child.firstChild);
      child.replaceWith(mark);
      continue;
    }
    if (child.tagName === "A") {
      child.removeAttribute("style");
      child.removeAttribute("class");
      continue;
    }
    docUnwrap(child);
  }
}

function docHighlightOf(element) {
  const background = element.style?.backgroundColor || "";
  if (background && background !== "transparent" && !/rgba\(0, 0, 0, 0\)/.test(background)) return background;
  if (element.tagName === "MARK") return DOC_HIGHLIGHTS[0].value;
  return "";
}

function toggleDocUnderlineMode() {
  docUnderlineMode = !docUnderlineMode;
  updateDocToolbarState();
  els.saveStatus.textContent = docUnderlineMode ? "Underline mode on — select text to underline" : "Underline mode off";
}

function toggleDocHighlightMode() {
  docHighlightMode = !docHighlightMode;
  updateDocToolbarState();
  els.saveStatus.textContent = docHighlightMode ? "Highlight mode on — select text to highlight" : "Highlight mode off";
}

function promptDocLink() {
  docFocusEditor();
  const existing = docCurrentLink();
  const url = window.prompt("Link URL (leave blank to remove)", existing?.getAttribute("href") || "https://");
  if (url === null) return;
  const trimmed = url.trim();
  if (!trimmed) {
    docCommand(() => document.execCommand("unlink"));
    return;
  }
  if (!docSafeUrl(trimmed)) {
    els.saveStatus.textContent = "Link ignored — only http, https and mailto links are allowed";
    return;
  }
  docCommand(() => {
    if (docRange()?.collapsed && !existing) document.execCommand("insertText", false, trimmed);
    docExpandToWord();
    document.execCommand("createLink", false, trimmed);
  });
}

function docCurrentLink() {
  const range = docRange();
  const node = range?.startContainer;
  const element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
  return element?.closest("a") || null;
}

function docSafeUrl(url) {
  return /^(https?:|mailto:)/i.test(url.trim());
}

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

function insertDocTable(rows, columns) {
  docCommand(() => {
    const table = document.createElement("table");
    table.className = "doc-table";
    const body = document.createElement("tbody");
    for (let row = 0; row < rows; row += 1) {
      const tr = document.createElement("tr");
      for (let column = 0; column < columns; column += 1) tr.append(docNewCell("td"));
      body.append(tr);
    }
    table.append(body);
    const trailing = docNewParagraph();
    const anchor = docCurrentTopBlock();
    if (anchor) anchor.after(table, trailing);
    else els.journalDoc.append(table, trailing);
    docPlaceCaret(table.querySelector("td"));
  });
}

function docNewCell(tag) {
  const cell = document.createElement(tag);
  cell.append(document.createElement("br"));
  return cell;
}

function docNewParagraph() {
  const paragraph = document.createElement("p");
  paragraph.append(document.createElement("br"));
  return paragraph;
}

function docTableAction(action) {
  const cell = docCurrentCell();
  if (!cell) {
    els.saveStatus.textContent = "Put the cursor in a table first";
    return;
  }
  docCommand(() => {
    const row = cell.parentElement;
    const table = cell.closest("table");
    const index = [...row.children].indexOf(cell);
    if (action === "rowAbove" || action === "rowBelow") {
      // Always body cells: adding a row while the caret sits in the header row
      // is a request for a data row, not for a second header.
      const fresh = document.createElement("tr");
      for (let column = 0; column < row.children.length; column += 1) fresh.append(docNewCell("td"));
      if (action === "rowAbove") row.before(fresh);
      else row.after(fresh);
      docPlaceCaret(fresh.firstElementChild);
      return;
    }
    if (action === "columnLeft" || action === "columnRight") {
      for (const sibling of table.querySelectorAll("tr")) {
        const reference = sibling.children[index];
        const fresh = docNewCell(reference?.tagName === "TH" ? "th" : "td");
        if (!reference) sibling.append(fresh);
        else if (action === "columnLeft") reference.before(fresh);
        else reference.after(fresh);
      }
      docPlaceCaret(row.children[action === "columnLeft" ? index : index + 1]);
      return;
    }
    if (action === "deleteRow") {
      const next = row.nextElementSibling || row.previousElementSibling;
      row.remove();
      if (!table.querySelector("tr")) return docRemoveTable(table);
      docPlaceCaret(next?.children[Math.min(index, (next?.children.length || 1) - 1)]);
      return;
    }
    if (action === "deleteColumn") {
      for (const sibling of [...table.querySelectorAll("tr")]) sibling.children[index]?.remove();
      if (!table.querySelector("td, th")) return docRemoveTable(table);
      docPlaceCaret(row.children[Math.min(index, row.children.length - 1)]);
      return;
    }
    if (action === "headerRow") {
      const first = table.querySelector("tr");
      if (!first) return undefined;
      const toHeader = first.firstElementChild?.tagName === "TD";
      const rebuilt = [];
      for (const source of [...first.children]) {
        const replacement = document.createElement(toHeader ? "th" : "td");
        while (source.firstChild) replacement.append(source.firstChild);
        source.replaceWith(replacement);
        rebuilt.push(replacement);
      }
      // Swapping out the cell the caret sat in collapses the selection onto the
      // row, so put it back in the equivalent cell.
      if (row === first && rebuilt.length) docPlaceCaret(rebuilt[Math.min(index, rebuilt.length - 1)], true);
      return undefined;
    }
    if (action === "deleteTable") return docRemoveTable(table);
    return undefined;
  });
}

function docRemoveTable(table) {
  const paragraph = docNewParagraph();
  table.replaceWith(paragraph);
  docPlaceCaret(paragraph);
}

function moveDocCell(cell, direction) {
  const table = cell.closest("table");
  const cells = [...table.querySelectorAll("td, th")];
  const next = cells[cells.indexOf(cell) + direction];
  if (next) {
    docPlaceCaret(next);
    return;
  }
  if (direction < 0) return;
  docTableAction("rowBelow");
}

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------

function buildDocToolbar() {
  if (docToolbarBuilt || !els.docToolbar) return;
  const bar = els.docToolbar;
  bar.innerHTML = "";
  bar.append(
    docToolGroup([
      docToolButton({ label: "↶", title: "Undo (Ctrl+Z)", action: docUndo }),
      docToolButton({ label: "↷", title: "Redo (Ctrl+Y)", action: docRedo })
    ]),
    docToolGroup([docStyleSelect()]),
    docToolGroup([
      docToolButton({ label: "A−", title: "Smaller (Ctrl+,)", action: () => stepDocFontSize(-1) }),
      docFontSizeSelect(),
      docToolButton({ label: "A+", title: "Larger (Ctrl+.)", action: () => stepDocFontSize(1) })
    ]),
    docToolGroup([
      docToolButton({ label: "B", title: "Bold (Ctrl+B)", command: "bold", className: "doc-tool-bold" }),
      docToolButton({ label: "I", title: "Italic (Ctrl+I)", command: "italic", className: "doc-tool-italic" }),
      docToolButton({ label: "U", title: "Underline (Ctrl+U)", command: "underline", className: "doc-tool-underline" }),
      docToolButton({ label: "S", title: "Strikethrough (Ctrl+Shift+X)", command: "strikeThrough", className: "doc-tool-strike" }),
      docToolButton({ label: "x²", title: "Superscript", command: "superscript" }),
      docToolButton({ label: "x₂", title: "Subscript", command: "subscript" })
    ]),
    docToolGroup([docTextColorMenu(), docHighlightMenu()]),
    docToolGroup([
      docToolButton({ label: "U", title: "Underline mode (F9) — selecting text underlines it straight away", action: toggleDocUnderlineMode, key: "underlineMode", className: "doc-tool-mode doc-tool-underline" }),
      docToolButton({ label: "H", title: "Highlight mode — selecting text highlights it straight away", action: toggleDocHighlightMode, key: "highlightMode", className: "doc-tool-mode" }),
      docToolButton({ label: "▣", title: "Emphasis box (F10)", action: applyDocEmphasis }),
      docToolButton({ label: "A↓", title: "Shrink everything except underlined text (Ctrl+8)", action: shrinkDocSelection }),
      docCondenseMenu(),
      docToolButton({ label: "Tx", title: "Clear formatting, keep highlighting (Ctrl+\\)", action: () => clearDocFormatting() })
    ]),
    docToolGroup([
      docToolButton({ icon: docAlignIcon("left"), title: "Align left (Ctrl+Shift+L)", command: "justifyLeft" }),
      docToolButton({ icon: docAlignIcon("center"), title: "Center (Ctrl+Shift+E)", command: "justifyCenter" }),
      docToolButton({ icon: docAlignIcon("right"), title: "Align right (Ctrl+Shift+R)", command: "justifyRight" }),
      docToolButton({ icon: docAlignIcon("justify"), title: "Justify (Ctrl+Shift+J)", command: "justifyFull" }),
      docLineSpacingMenu()
    ]),
    docToolGroup([
      docToolButton({ icon: docListIcon(false), title: "Bulleted list (Ctrl+Shift+8)", command: "insertUnorderedList" }),
      docToolButton({ icon: docListIcon(true), title: "Numbered list (Ctrl+Shift+7)", command: "insertOrderedList" }),
      docToolButton({ label: "⇤", title: "Decrease indent (Shift+Tab)", action: () => docInlineCommand("outdent") }),
      docToolButton({ label: "⇥", title: "Increase indent (Tab)", action: () => docInlineCommand("indent") })
    ]),
    docToolGroup([
      docTableMenu(),
      docToolButton({ label: "—", title: "Horizontal line", action: () => docInlineCommand("insertHorizontalRule") }),
      docToolButton({ label: "Link", title: "Insert or edit link (Ctrl+K)", action: promptDocLink }),
      docToolButton({ label: "🖼", title: "Insert picture (or paste/drop one)", action: promptDocImage })
    ]),
    docWordCountLabel()
  );
  docToolbarBuilt = true;
}

function docToolGroup(children) {
  const group = document.createElement("div");
  group.className = "doc-tool-group";
  group.append(...children);
  return group;
}

function docToolButton({ label, icon, title, action, command, className, key }) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `doc-tool${className ? ` ${className}` : ""}`;
  button.title = title;
  button.setAttribute("aria-label", title);
  if (icon) button.append(icon);
  else button.textContent = label;
  if (command) button.dataset.docCommand = command;
  if (key) button.dataset.docToggle = key;
  // Keeping the mousedown from landing means the editor never loses its selection.
  button.addEventListener("mousedown", (event) => event.preventDefault());
  button.addEventListener("click", () => {
    if (command) docInlineCommand(command);
    else action();
  });
  return button;
}

function docStyleSelect() {
  const select = document.createElement("select");
  select.className = "doc-tool-select";
  select.id = "docStyleSelect";
  select.title = "Paragraph style";
  for (const style of DOC_BLOCK_STYLES) {
    const option = document.createElement("option");
    option.value = style.key;
    option.textContent = style.label;
    option.title = style.title;
    select.append(option);
  }
  select.addEventListener("change", () => applyDocBlockStyle(select.value));
  return select;
}

function docFontSizeSelect() {
  const select = document.createElement("select");
  select.className = "doc-tool-select doc-tool-size";
  select.id = "docSizeSelect";
  select.title = "Font size (points)";
  for (const size of DOC_FONT_SIZES) {
    const option = document.createElement("option");
    option.value = String(size);
    option.textContent = String(size);
    select.append(option);
  }
  select.addEventListener("change", () => applyDocFontSize(Number(select.value)));
  return select;
}

function docMenuButton({ label, title, build, className }) {
  const wrapper = document.createElement("div");
  wrapper.className = "doc-tool-menu-wrap";
  const button = document.createElement("button");
  button.type = "button";
  button.className = `doc-tool doc-tool-menu-button${className ? ` ${className}` : ""}`;
  button.title = title;
  button.setAttribute("aria-label", title);
  button.innerHTML = "";
  button.append(typeof label === "string" ? document.createTextNode(label) : label);
  const caret = document.createElement("span");
  caret.className = "doc-tool-caret";
  caret.textContent = "▾";
  button.append(caret);
  const menu = document.createElement("div");
  menu.className = "doc-menu hidden";
  menu.docOwner = button;
  build(menu);
  button.addEventListener("mousedown", (event) => event.preventDefault());
  button.addEventListener("click", () => {
    if (docOpenMenu === menu) {
      closeDocMenu();
      return;
    }
    closeDocMenu();
    menu.classList.remove("hidden");
    docOpenMenu = menu;
  });
  wrapper.append(button, menu);
  return wrapper;
}

function closeDocMenu() {
  if (!docOpenMenu) return;
  docOpenMenu.classList.add("hidden");
  docOpenMenu = null;
}

function docMenuItem(label, action) {
  const item = document.createElement("button");
  item.type = "button";
  item.className = "doc-menu-item";
  item.textContent = label;
  item.addEventListener("mousedown", (event) => event.preventDefault());
  item.addEventListener("click", () => {
    closeDocMenu();
    action();
  });
  return item;
}

function docSwatchRow(colors, onPick) {
  const row = document.createElement("div");
  row.className = "doc-swatch-row";
  for (const color of colors) {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "doc-swatch";
    swatch.title = color.label;
    swatch.setAttribute("aria-label", color.label);
    swatch.style.background = color.value || "transparent";
    if (!color.value) swatch.textContent = "✕";
    swatch.addEventListener("mousedown", (event) => event.preventDefault());
    swatch.addEventListener("click", () => {
      closeDocMenu();
      onPick(color.value);
    });
    row.append(swatch);
  }
  return row;
}

function docTextColorMenu() {
  const label = document.createElement("span");
  label.className = "doc-tool-colorlabel";
  label.textContent = "A";
  return docMenuButton({
    label,
    title: "Text colour",
    build: (menu) => {
      menu.append(docSwatchRow(DOC_TEXT_COLORS, applyDocTextColor));
    }
  });
}

function docHighlightMenu() {
  const label = document.createElement("span");
  label.className = "doc-tool-highlightlabel";
  label.textContent = "A";
  label.style.background = docHighlightColor;
  return docMenuButton({
    label,
    title: "Highlight (F11 applies the current colour)",
    build: (menu) => {
      menu.append(docSwatchRow(DOC_HIGHLIGHTS, (value) => {
        docHighlightColor = value;
        label.style.background = value;
        applyDocHighlight(value);
      }));
      menu.append(docMenuItem("Remove highlight", removeDocHighlight));
    }
  });
}

function docCondenseMenu() {
  return docMenuButton({
    label: "⇉",
    title: "Condense the selection into one paragraph (F3)",
    build: (menu) => {
      menu.append(docMenuItem("Condense (F3)", () => condenseDocSelection(" ")));
      menu.append(docMenuItem("Condense with pilcrows", () => condenseDocSelection(" ¶ ")));
      menu.append(docMenuItem("Reset text size", resetDocFontSize));
      menu.append(docMenuItem("Clear all formatting", () => clearDocFormatting({ all: true })));
    }
  });
}

function docLineSpacingMenu() {
  return docMenuButton({
    label: "⇕",
    title: "Line spacing",
    build: (menu) => {
      for (const spacing of DOC_LINE_SPACINGS) {
        menu.append(docMenuItem(spacing.label, () => applyDocLineSpacing(spacing.value)));
      }
    }
  });
}

function docTableMenu() {
  return docMenuButton({
    label: "Table",
    title: "Insert or edit a table",
    build: (menu) => {
      menu.append(docTableGridPicker());
      const actions = [
        ["Insert row above", "rowAbove"],
        ["Insert row below", "rowBelow"],
        ["Insert column left", "columnLeft"],
        ["Insert column right", "columnRight"],
        ["Delete row", "deleteRow"],
        ["Delete column", "deleteColumn"],
        ["Toggle header row", "headerRow"],
        ["Delete table", "deleteTable"]
      ];
      for (const [label, action] of actions) menu.append(docMenuItem(label, () => docTableAction(action)));
    }
  });
}

function docTableGridPicker() {
  const wrap = document.createElement("div");
  wrap.className = "doc-grid-picker";
  const readout = document.createElement("div");
  readout.className = "doc-grid-readout";
  readout.textContent = "Insert table";
  const grid = document.createElement("div");
  grid.className = "doc-grid";
  const cells = [];
  for (let row = 1; row <= 6; row += 1) {
    for (let column = 1; column <= 8; column += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "doc-grid-cell";
      cell.dataset.row = String(row);
      cell.dataset.column = String(column);
      cell.title = `${row} × ${column}`;
      cell.addEventListener("mousedown", (event) => event.preventDefault());
      cell.addEventListener("mouseenter", () => {
        readout.textContent = `${row} × ${column}`;
        for (const other of cells) {
          const active = Number(other.dataset.row) <= row && Number(other.dataset.column) <= column;
          other.classList.toggle("active", active);
        }
      });
      cell.addEventListener("click", () => {
        closeDocMenu();
        insertDocTable(row, column);
      });
      cells.push(cell);
      grid.append(cell);
    }
  }
  grid.addEventListener("mouseleave", () => {
    readout.textContent = "Insert table";
    for (const cell of cells) cell.classList.remove("active");
  });
  wrap.append(readout, grid);
  return wrap;
}

function docAlignIcon(kind) {
  const widths = {
    left: [16, 10, 14, 8],
    center: [16, 10, 14, 8],
    right: [16, 10, 14, 8],
    justify: [16, 16, 16, 16]
  }[kind];
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 18 14");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  widths.forEach((width, index) => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    const x = kind === "right" ? 17 - width : kind === "center" ? (18 - width) / 2 : 1;
    line.setAttribute("x", String(x));
    line.setAttribute("y", String(1 + index * 3.4));
    line.setAttribute("width", String(width));
    line.setAttribute("height", "1.6");
    line.setAttribute("rx", "0.8");
    svg.append(line);
  });
  return svg;
}

function docListIcon(ordered) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 18 14");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  for (let index = 0; index < 3; index += 1) {
    const y = 2 + index * 4.5;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    line.setAttribute("x", "6");
    line.setAttribute("y", String(y));
    line.setAttribute("width", "11");
    line.setAttribute("height", "1.6");
    line.setAttribute("rx", "0.8");
    svg.append(line);
    if (ordered) {
      const number = document.createElementNS("http://www.w3.org/2000/svg", "text");
      number.setAttribute("x", "0");
      number.setAttribute("y", String(y + 1.9));
      number.setAttribute("font-size", "5");
      number.textContent = String(index + 1);
      svg.append(number);
    } else {
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("cx", "2.2");
      dot.setAttribute("cy", String(y + 0.8));
      dot.setAttribute("r", "1.5");
      svg.append(dot);
    }
  }
  return svg;
}

function docWordCountLabel() {
  const label = document.createElement("div");
  label.className = "doc-word-count";
  label.id = "docWordCount";
  return label;
}

// setTimeout rather than requestAnimationFrame: rAF is paused while the window
// is hidden or occluded, which left the toolbar and word count frozen on stale
// values until the page composited a frame again.
function scheduleDocToolbarState() {
  if (docToolbarStatePending) return;
  docToolbarStatePending = true;
  setTimeout(() => {
    docToolbarStatePending = false;
    updateDocToolbarState();
  }, 0);
}

function updateDocToolbarState() {
  const bar = els.docToolbar;
  if (!bar || !docToolbarBuilt) return;
  const inside = docSelectionInside();
  for (const button of bar.querySelectorAll("[data-doc-command]")) {
    let active = false;
    if (inside) {
      try {
        active = document.queryCommandState(button.dataset.docCommand);
      } catch {
        active = false;
      }
    }
    button.classList.toggle("active", active);
  }
  for (const button of bar.querySelectorAll("[data-doc-toggle]")) {
    const on = button.dataset.docToggle === "underlineMode" ? docUnderlineMode : docHighlightMode;
    button.classList.toggle("active", on);
    button.setAttribute("aria-pressed", String(on));
  }
  const styleSelect = bar.querySelector("#docStyleSelect");
  if (styleSelect) styleSelect.value = docCurrentStyleKey();
  const sizeSelect = bar.querySelector("#docSizeSelect");
  if (sizeSelect) {
    const size = inside ? docCurrentPointSize() : DOC_BASE_POINT_SIZE;
    const nearest = DOC_FONT_SIZES.reduce((best, option) => (Math.abs(option - size) < Math.abs(best - size) ? option : best), DOC_FONT_SIZES[0]);
    sizeSelect.value = String(nearest);
  }
  const count = bar.querySelector("#docWordCount");
  if (count) {
    const words = (els.journalDoc.textContent || "").trim().split(/\s+/).filter(Boolean).length;
    count.textContent = `${words.toLocaleString()} word${words === 1 ? "" : "s"}`;
  }
}

function docCurrentStyleKey() {
  const block = docCurrentBlock();
  if (!block) return "body";
  const className = [...block.classList].find((name) => DOC_ALLOWED_CLASSES.has(name)) || "";
  const match = DOC_BLOCK_STYLES.find((style) => style.tag === block.tagName.toLowerCase() && style.className === className)
    || DOC_BLOCK_STYLES.find((style) => style.className && style.className === className)
    || DOC_BLOCK_STYLES.find((style) => style.tag === block.tagName.toLowerCase() && !style.className);
  return match?.key || "body";
}

// ---------------------------------------------------------------------------
// Structure helpers, sanitising, plain-text and markdown mirrors
// ---------------------------------------------------------------------------

function docUnwrap(element) {
  const parent = element.parentNode;
  if (!parent) return;
  while (element.firstChild) parent.insertBefore(element.firstChild, element);
  element.remove();
}

function docTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}

// Loose text or inline markup sitting straight in the root has no block to style,
// so it gets wrapped. Nodes are moved rather than re-created, which keeps the
// caret alive through the fix-up.
function docNormalize() {
  const doc = els.journalDoc;
  if (!doc) return;
  if (!doc.firstChild) {
    doc.append(docNewParagraph());
    return;
  }
  // Extracting a range leaves childless husks behind -- condense and clear both
  // do it. A paragraph the user actually left blank always holds a <br>, so
  // :empty only ever matches the debris.
  for (const husk of doc.querySelectorAll("p:empty, div:empty, h1:empty, h2:empty, h3:empty, h4:empty, h5:empty, h6:empty, blockquote:empty, li:empty")) {
    husk.remove();
  }
  // Chrome's list commands sometimes reuse the paragraph as the container and
  // leave <p><ul>...</ul></p>. That nesting is invalid, so the markdown export
  // sees a paragraph instead of a list and a reload silently restructures it --
  // the HTML parser closes the <p> before the <ul>. Lift the list out here.
  for (const nested of [...doc.querySelectorAll("ul, ol, table")]) {
    const parent = nested.parentElement;
    if (!parent || parent === doc || !/^(P|DIV|H[1-6])$/.test(parent.tagName)) continue;
    if (parent.childNodes.length === 1) parent.replaceWith(nested);
    else parent.after(nested);
  }
  if (!doc.firstChild) {
    doc.append(docNewParagraph());
    return;
  }
  let loose = [];
  const flush = () => {
    if (!loose.length) return;
    const meaningful = loose.some((node) => node.nodeType !== Node.TEXT_NODE || node.nodeValue.trim());
    if (meaningful) {
      const paragraph = document.createElement("p");
      loose[0].before(paragraph);
      for (const node of loose) paragraph.append(node);
    } else {
      for (const node of loose) node.remove();
    }
    loose = [];
  };
  for (const child of [...doc.childNodes]) {
    if (child.nodeType === Node.ELEMENT_NODE && child.matches(DOC_TOP_BLOCK_SELECTOR)) {
      flush();
      continue;
    }
    loose.push(child);
  }
  flush();
}

function sanitizeDocHtml(html) {
  const parsed = new DOMParser().parseFromString(`<div id="doc-sanitize-root">${String(html || "")}</div>`, "text/html");
  const root = parsed.getElementById("doc-sanitize-root");
  if (!root) return "";
  docSanitizeNode(root);
  return root.innerHTML;
}

function docSanitizeNode(node) {
  for (const child of [...node.childNodes]) {
    if (child.nodeType === Node.TEXT_NODE) continue;
    if (child.nodeType !== Node.ELEMENT_NODE) {
      child.remove();
      continue;
    }
    if (["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "LINK", "META", "FORM", "INPUT", "BUTTON", "SELECT", "TEXTAREA", "SVG"].includes(child.tagName)) {
      child.remove();
      continue;
    }
    // Images survive only when they point at the local media store; anything
    // else (remote URLs, data: URIs from a Word paste) is dropped outright —
    // an <img> has no children, so unwrapping would leave nothing anyway.
    if (child.tagName === "IMG" && !DOC_IMAGE_SRC_PATTERN.test(child.getAttribute("src") || "")) {
      child.remove();
      continue;
    }
    docSanitizeNode(child);
    // Deprecated tags keep their meaning but lose their attributes: <font
    // size>/<font face> is exactly the font control the Document view is not
    // supposed to expose, so only style/class survive the swap.
    const replacement = DOC_TAG_REPLACEMENTS[child.tagName];
    if (replacement) {
      const element = child.ownerDocument.createElement(replacement);
      for (const attribute of ["style", "class"]) {
        if (child.hasAttribute(attribute)) element.setAttribute(attribute, child.getAttribute(attribute));
      }
      while (child.firstChild) element.append(child.firstChild);
      child.replaceWith(element);
      docSanitizeElement(element);
      continue;
    }
    if (!DOC_ALLOWED_TAGS.has(child.tagName)) {
      docUnwrap(child);
      continue;
    }
    docSanitizeElement(child);
  }
}

function docSanitizeElement(element) {
  for (const attribute of [...element.attributes]) {
    const name = attribute.name.toLowerCase();
    if (name === "style" || name === "class") continue;
    if (name === "colspan" || name === "rowspan") continue;
    if (name === "href" && element.tagName === "A") continue;
    if ((name === "src" || name === "alt") && element.tagName === "IMG") continue;
    element.removeAttribute(attribute.name);
  }
  if (element.tagName === "A") {
    const href = element.getAttribute("href") || "";
    if (!docSafeUrl(href)) element.removeAttribute("href");
    else {
      element.setAttribute("target", "_blank");
      element.setAttribute("rel", "noreferrer noopener");
    }
  }
  const classes = [...element.classList].filter((name) => DOC_ALLOWED_CLASSES.has(name));
  if (classes.length) element.setAttribute("class", classes.join(" "));
  else element.removeAttribute("class");
  const style = element.getAttribute("style");
  if (style === null) return;
  const kept = [];
  for (const declaration of style.split(";")) {
    const [rawName, ...rest] = declaration.split(":");
    const name = rawName.trim().toLowerCase();
    const value = rest.join(":").trim();
    if (!name || !value || !DOC_ALLOWED_STYLES.has(name)) continue;
    if (/url\(|expression|javascript:/i.test(value)) continue;
    kept.push(`${name}: ${value}`);
  }
  if (kept.length) element.setAttribute("style", `${kept.join("; ")};`);
  else element.removeAttribute("style");
}

function docHtmlFromPlainText(text) {
  const lines = String(text || "").split(/\r?\n/);
  if (!lines.length) return "<p><br></p>";
  return lines
    .map((line) => (line.trim() ? `<p>${docEscapeHtml(line)}</p>` : "<p><br></p>"))
    .join("");
}

function docEscapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// The plain-text mirror. Block elements become newlines and table cells become
// tabs, so a "09:00-10:00 gym" line still reads as one line to extractHours().
function docPlainText(root) {
  let out = "";
  const walk = (node) => {
    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        out += child.nodeValue.replace(/ /g, " ");
        continue;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      const tag = child.tagName;
      if (tag === "BR") {
        out += "\n";
        continue;
      }
      if (tag === "HR") {
        if (out && !out.endsWith("\n")) out += "\n";
        out += "---\n";
        continue;
      }
      if (tag === "TD" || tag === "TH") {
        walk(child);
        out += "\t";
        continue;
      }
      if (DOC_LINE_TAGS.has(tag)) {
        if (out && !out.endsWith("\n")) out += "\n";
        walk(child);
        if (!out.endsWith("\n")) out += "\n";
        continue;
      }
      walk(child);
    }
  };
  walk(root);
  return out
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function journalMarkdownSection(entry) {
  const html = typeof entry?.journalHtml === "string" ? entry.journalHtml.trim() : "";
  if (!html) return entry?.journal || "";
  return docMarkdownFromHtml(html) || entry?.journal || "";
}

// Markdown is the durable export, so the formatting has to survive it: headings
// stay headings, highlights become ==marks==, tables become GFM pipe tables.
function docMarkdownFromHtml(html) {
  const holder = document.createElement("div");
  holder.innerHTML = sanitizeDocHtml(html);
  const blocks = [];
  for (const child of holder.childNodes) blocks.push(...docMarkdownBlock(child, ""));
  return blocks.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function docMarkdownBlock(node, indent) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.nodeValue.trim();
    return text ? [`${indent}${text}`] : [];
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return [];
  const tag = node.tagName;
  if (tag === "HR") return ["", "---", ""];
  if (/^H[1-6]$/.test(tag)) return ["", `${"#".repeat(Number(tag[1]))} ${docMarkdownInline(node).trim()}`, ""];
  if (tag === "PRE") return ["", "```", node.textContent.replace(/\s+$/, ""), "```", ""];
  if (tag === "BLOCKQUOTE") {
    const inner = [];
    for (const child of node.childNodes) inner.push(...docMarkdownBlock(child, ""));
    return ["", ...inner.filter(Boolean).map((line) => `> ${line}`), ""];
  }
  if (tag === "UL" || tag === "OL") {
    const lines = [];
    let index = 0;
    for (const item of node.children) {
      // Indenting a list item makes Chrome nest the sublist as a sibling of the
      // item rather than inside it, so both shapes have to be handled.
      if (item.tagName === "UL" || item.tagName === "OL") {
        lines.push(...docMarkdownBlock(item, `${indent}  `).filter((line) => line.trim()));
        continue;
      }
      if (item.tagName !== "LI") continue;
      index += 1;
      const bullet = tag === "OL" ? `${index}. ` : "- ";
      const nested = [...item.children].filter((child) => ["UL", "OL"].includes(child.tagName));
      const own = document.createElement("div");
      for (const child of [...item.childNodes]) {
        if (!nested.includes(child)) own.append(child.cloneNode(true));
      }
      lines.push(`${indent}${bullet}${docMarkdownInline(own).trim()}`);
      for (const list of nested) lines.push(...docMarkdownBlock(list, `${indent}  `));
    }
    return lines.length ? ["", ...lines, ""] : [];
  }
  if (tag === "TABLE") return docMarkdownTable(node);
  if (tag === "P" || tag === "DIV") {
    const text = docMarkdownInline(node).trim();
    return text ? [text, ""] : [""];
  }
  const inline = docMarkdownInline(node).trim();
  return inline ? [`${indent}${inline}`] : [];
}

function docMarkdownTable(table) {
  const rows = [...table.querySelectorAll("tr")];
  if (!rows.length) return [];
  const lines = [];
  rows.forEach((row, index) => {
    const cells = [...row.children].map((cell) => docMarkdownInline(cell).replace(/\|/g, "\\|").replace(/\s+/g, " ").trim());
    lines.push(`| ${cells.join(" | ")} |`);
    if (index === 0) lines.push(`|${cells.map(() => "---").join("|")}|`);
  });
  return ["", ...lines, ""];
}

function docMarkdownInline(node) {
  let out = "";
  for (const child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      out += child.nodeValue.replace(/\s+/g, " ");
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    const tag = child.tagName;
    const inner = docMarkdownInline(child);
    if (tag === "BR") out += "  \n";
    // Before the empty-inner shortcut: an <img> has no inner text at all.
    else if (tag === "IMG") out += `![${child.getAttribute("alt") || ""}](${child.getAttribute("src") || ""})`;
    else if (!inner.trim()) out += inner;
    else if (tag === "B" || tag === "STRONG") out += `**${inner}**`;
    else if (tag === "I" || tag === "EM") out += `*${inner}*`;
    else if (tag === "U") out += `<u>${inner}</u>`;
    else if (tag === "S") out += `~~${inner}~~`;
    else if (tag === "CODE") out += `\`${inner}\``;
    else if (tag === "SUP") out += `^${inner}^`;
    else if (tag === "SUB") out += `~${inner}~`;
    else if (tag === "MARK") out += `==${inner}==`;
    else if (tag === "A") out += `[${inner}](${child.getAttribute("href") || ""})`;
    else if (docHighlightOf(child)) out += `==${inner}==`;
    else out += inner;
  }
  return out;
}

async function copyDocumentToClipboard() {
  syncDocumentText();
  const entry = currentEntry();
  const text = buildDocumentText();
  const html = `<h1>${docEscapeHtml(formatDateLine(state.currentDate))}</h1>${sanitizeDocHtml(entryDocHtml(entry))}`;
  try {
    if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") throw new Error("rich clipboard unavailable");
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([text], { type: "text/plain" })
      })
    ]);
    els.saveStatus.textContent = "Copied with formatting";
  } catch {
    await copyText(text);
  }
}
