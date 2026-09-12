// Builds the event-colour canvas. Two knobs are explored, not one: which hue a
// category gets, and how much of that hue the chip is allowed to paint. The
// app today mixes 9% into a near-white panel, which is why no palette reads.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { LIGHT, DARK, LABELS, chipStyle, chipInk } from "./palette.mjs";

const here = dirname(fileURLToPath(import.meta.url));

const CURRENT = { Z: "#1f2933", G: "#a855f7", F: "#c084fc", D: "#f472b6", S: "#60a5fa", W: "#f59e0b", B: "#22d3ee", A: "#86efac", R: "#f87171", E: "#2563eb", H: "#e5e7eb", X: "#ef4444", V: "#fbbf24", C: "#fb923c", Q: "#d1d5db", T: "#4ade80", N: "#f0abfc" };

// A: hue carries life domain. Work is the only warm yellow; learning is a blue
// family; transit and errands are neutral.
const OPTION_A = { Z: "#1f2933", G: "#a855f7", F: "#d946ef", D: "#f472b6", N: "#be185d", S: "#3b82f6", C: "#6366f1", W: "#f59e0b", B: "#06b6d4", A: "#84cc16", T: "#22c55e", E: "#059669", H: "#2dd4bf", R: "#f87171", X: "#b91c1c", V: "#94a3b8", Q: "#a8a29e" };

// B: the six categories that fill a real week take maximally spaced hues; the
// long tail goes pastel so it never competes.
const OPTION_B = { Z: "#1f2933", G: "#d8b4fe", F: "#f0abfc", D: "#fbcfe8", S: "#0ea5e9", W: "#f59e0b", B: "#a5f3fc", A: "#d9f99d", R: "#e11d48", E: "#65a30d", H: "#e2e8f0", X: "#991b1b", V: "#14b8a6", C: "#7c3aed", Q: "#e7e5e4", T: "#86efac", N: "#fda4af" };

// C: A's hues, but strength carries commitment. Obligations paint strongly and
// routine glue stays near-white -- the wall-of-colour guard the styles.css note
// asks for, without flattening every category to 9%.
const OPTION_C = OPTION_A;
const STRONG = new Set(["C", "W", "E", "D", "X", "S", "N"]);
const FAINT = new Set(["V", "Q", "Z", "H"]);
const tieredFill = (code) => (STRONG.has(code) ? 0.3 : FAINT.has(code) ? 0.08 : 0.18);

const GROUPS = [
  ["Work &amp; output", ["W", "B"]],
  ["Learning", ["C", "S"]],
  ["People", ["G", "F", "D", "N"]],
  ["Body", ["E", "H"]],
  ["Leisure", ["R", "A", "T"]],
  ["Logistics", ["V", "Q", "Z"]],
  ["Alert", ["X"]]
];

// An invented but real-shaped Tuesday, 07:00-23:00, in minutes from midnight.
// The transit/class/work adjacency in the morning is the thing under test.
const DAY = [
  [450, 480, "V", "train to campus"],
  [480, 580, "C", "Macroeconomics lecture"],
  [580, 600, "V", "train back"],
  [600, 750, "W", "deep work: API refactor"],
  [750, 795, "Q", "lunch"],
  [795, 900, "W", "design doc"],
  [900, 1000, "C", "Statistics seminar"],
  [1000, 1030, "V", "train home"],
  [1030, 1110, "S", "problem set"],
  [1110, 1155, "E", "gym, shower"],
  [1155, 1200, "Q", "dinner"],
  [1200, 1290, "F", "hang out with Sam"],
  [1290, 1350, "R", "chess"],
  [1350, 1380, "H", "wind down, ready for bed"]
];

const HOUR_PX = 48;
const DAY_START = 7 * 60;
const DAY_END = 23 * 60;
const COLUMN_PX = ((DAY_END - DAY_START) / 60) * HOUR_PX;
const RAMP_STEPS = [0.09, 0.16, 0.24, 0.32, 0.45];

const fmt = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;

function dayColumn(palette, theme, fillFor) {
  const grid = [];
  for (let m = DAY_START; m < DAY_END; m += 60) {
    const y = ((m - DAY_START) / 60) * HOUR_PX;
    if (m > DAY_START) grid.push(`<div style="position:absolute;left:0;right:0;top:${y}px;border-top:1px solid ${theme.line};"></div>`);
    grid.push(`<div style="position:absolute;left:4px;top:${y + 2}px;font-size:10px;color:${theme.muted};">${fmt(m)}</div>`);
  }
  const blocks = DAY.map(([start, end, code, title]) => {
    const top = ((start - DAY_START) / 60) * HOUR_PX;
    const height = ((end - start) / 60) * HOUR_PX - 3;
    const color = palette[code];
    const fill = fillFor(code);
    const ink = chipInk(color, theme, fill);
    // Mirrors the app's is-compact / is-tiny rules: the time line only appears
    // when the block is tall enough to hold it without clipping.
    let inner;
    let padding = "0 7px";
    if (height >= 40) {
      padding = "4px 7px";
      inner = `<strong style="font-size:12px;line-height:1.25;font-weight:600;display:block;overflow:hidden;">${title}</strong><span style="font-size:11px;line-height:1.25;color:${ink.muted};display:block;">${fmt(start)} – ${fmt(end)}</span>`;
    } else if (height >= 18) {
      inner = `<strong style="font-size:12px;line-height:1.2;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;">${title}</strong>`;
    } else {
      inner = `<strong style="font-size:9px;line-height:1;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;">${title}</strong>`;
    }
    const centre = height < 40 ? "display:flex;align-items:center;" : "";
    return `<div style="position:absolute;left:44px;right:8px;top:${top}px;height:${height}px;overflow:hidden;padding:${padding};${centre}${chipStyle(color, theme, { fill })}">${inner}</div>`;
  });
  return `<div style="position:relative;flex:1 1 0;min-width:0;height:${COLUMN_PX + 2}px;background:${theme.panel};border:1px solid ${theme.line};border-radius:10px;overflow:hidden;">${grid.join("")}${blocks.join("")}</div>`;
}

function legend(palette, theme, fillFor) {
  const groups = GROUPS.map(([name, codes]) => {
    const rows = codes.map((code) => {
      const color = palette[code];
      const ink = chipInk(color, theme, fillFor(code));
      return `<div style="display:flex;align-items:center;gap:8px;padding:5px 8px;${chipStyle(color, theme, { fill: fillFor(code) })}"><span style="font-size:11px;font-weight:700;color:${ink.muted};width:12px;">${code}</span><strong style="font-size:12px;font-weight:600;flex:1 1 auto;">${LABELS[code]}</strong><span style="font-size:10px;color:${ink.muted};font-family:ui-monospace,Consolas,monospace;">${color}</span></div>`;
    }).join("");
    return `<div style="display:flex;flex-direction:column;gap:5px;"><div style="font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${theme.muted};">${name}</div>${rows}</div>`;
  }).join("");
  return `<div style="display:flex;flex-direction:column;gap:12px;width:300px;flex:0 0 300px;">${groups}</div>`;
}

function nightStrip(palette, fillFor) {
  const chips = ["V", "C", "W", "S", "R"].map((code) => {
    const fill = fillFor(code);
    return `<div style="flex:1 1 0;padding:6px 8px;${chipStyle(palette[code], DARK, { fill })}"><strong style="font-size:12px;font-weight:600;display:block;">${LABELS[code]}</strong></div>`;
  }).join("");
  return `<div style="display:flex;flex-direction:column;gap:6px;"><div style="font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${LIGHT.muted};">Night theme check</div><div style="display:flex;gap:8px;padding:10px;background:${DARK.bg};border-radius:10px;">${chips}</div></div>`;
}

function page({ name, subtitle, tradeoff, body }) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;display=swap">
  <style>
    body { margin: 0; background: ${LIGHT.bg}; color: ${LIGHT.ink}; font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
    a { color: #116b68; } a:hover { color: #0d504e; }
  </style>
</helmet>
<div style="width:920px;padding:24px;display:flex;flex-direction:column;gap:16px;background:${LIGHT.bg};">
  <div style="display:flex;flex-direction:column;gap:6px;">
    <h1 style="margin:0;font-size:20px;font-weight:700;">${name}</h1>
    <p style="margin:0;font-size:13px;line-height:1.5;max-width:70ch;">${subtitle}</p>
    <p style="margin:0;font-size:12px;line-height:1.5;color:${LIGHT.muted};max-width:70ch;">${tradeoff}</p>
  </div>
  ${body}
</div>
</x-dc>
<script data-dc-script data-props='{}'>
class Component extends DCLogic {
  renderVals() { return {}; }
}
</script>
</body>
</html>
`;
}

function optionBody(palette, fillFor) {
  return `<div style="display:flex;gap:20px;align-items:flex-start;">
    ${legend(palette, LIGHT, fillFor)}
    ${dayColumn(palette, LIGHT, fillFor)}
  </div>
  ${nightStrip(palette, fillFor)}`;
}

// The strength ramp: the same three colours across five fill levels, so the
// point that hue is invisible below ~20% is made by looking, not by argument.
function ramp(label, note, trio) {
  const cols = RAMP_STEPS.map((fill) => {
    const chips = trio.map(([code, color]) => {
      const ink = chipInk(color, LIGHT, fill);
      return `<div style="padding:7px 9px;${chipStyle(color, LIGHT, { fill })}"><strong style="font-size:12px;font-weight:600;display:block;">${LABELS[code]}</strong><span style="font-size:10px;color:${ink.muted};font-family:ui-monospace,Consolas,monospace;">${ink.background}</span></div>`;
    }).join("");
    const today = fill === 0.09;
    return `<div style="flex:1 1 0;display:flex;flex-direction:column;gap:6px;">
      <div style="font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${today ? "#b45309" : LIGHT.muted};">${Math.round(fill * 100)}% fill${today ? " · today" : ""}</div>
      ${chips}
    </div>`;
  }).join("");
  return `<div style="display:flex;flex-direction:column;gap:8px;">
    <div style="font-size:13px;font-weight:700;">${label}</div>
    <p style="margin:0;font-size:12px;line-height:1.5;color:${LIGHT.muted};max-width:80ch;">${note}</p>
    <div style="display:flex;gap:10px;align-items:flex-start;">${cols}</div>
  </div>`;
}

function diagnosis() {
  const body = `<div style="display:flex;flex-direction:column;gap:22px;">
    ${ramp(
      "1 · Today's three amber categories, down a strength ramp",
      "At the 9% the app paints today, Transportation, Class and Work are three shades of off-white — read the hex under each name. They only separate from one another around 24% and up.",
      [["V", CURRENT.V], ["C", CURRENT.C], ["W", CURRENT.W]]
    )}
    ${ramp(
      "2 · The same three slots given maximally distinct hues — still invisible at 9%",
      "Slate transit, indigo class, amber work: about as far apart as three hues get. At 9% they still paint #f5f6f4, #f1f0f9 and #fef5e4. Recolouring alone cannot fix this, which is why each option raises the fill as well as changing the hue.",
      [["V", OPTION_A.V], ["C", OPTION_A.C], ["W", OPTION_A.W]]
    )}
    <div style="display:flex;flex-direction:column;gap:8px;">
      <div style="font-size:13px;font-weight:700;">3 · Your calendar as it stands</div>
      <p style="margin:0;font-size:12px;line-height:1.5;color:${LIGHT.muted};max-width:80ch;">Colour is carried almost entirely by the 4px leading edge; the body of every block is the same near-white, so the morning run of train → class → train → work reads as one continuous slab.</p>
      <div style="display:flex;gap:20px;align-items:flex-start;">
        ${legend(CURRENT, LIGHT, () => 0.09)}
        ${dayColumn(CURRENT, LIGHT, () => 0.09)}
      </div>
    </div>
  </div>`;

  return page({
    name: "Why they blend",
    subtitle: "Transportation #fbbf24, Class #fb923c and Work #f59e0b are three near-identical warm hues — but that is only half the problem. Each chip mixes its colour 9% into a near-white panel, so every hue collapses to off-white.",
    tradeoff: "The 9% was deliberate — the note at styles.css:3159 records it was cut from 20% to stop a full week reading as a wall of colour. So the fix has two knobs: which hue a category gets, and how much of it a block may paint.",
    body
  });
}

const BOARDS = [
  { file: "Main.dc.html", html: diagnosis() },
  {
    file: "OptionA.dc.html",
    html: page({
      name: "Option A — Semantic families, 24% fill",
      subtitle: "Hue means life domain: Work is the only warm yellow, Class joins Studying in a learning-blue family (indigo vs azure), and Transportation and errands go neutral gray so connective tissue stops competing with chosen activities. Every block paints at 24% — enough for hue to survive the mix.",
      tradeoff: "Tradeoff: a busy week carries real colour again, closer to the wall the 9% was guarding against. And categories in one family share a hue region, so kin read as kin — told apart up close, but nearer each other than anything else.",
      body: optionBody(OPTION_A, () => 0.24)
    })
  },
  {
    file: "OptionB.dc.html",
    html: page({
      name: "Option B — Contrast first, 24% fill",
      subtitle: "The six categories that fill most of a real week — Work, Class, Studying, Transportation, Relaxation, Exercise — take maximally spaced saturated hues (amber, violet, sky, teal, rose, olive). Everything rare drops to pastel, Waste alone keeping a dark alarm red, so nothing steals separation from the big six.",
      tradeoff: "Tradeoff: assignments are less guessable — teal transit and violet class are memorised, not inferred — and the pastel long tail (Family, Friends, Dating) is told apart mostly by its labels.",
      body: optionBody(OPTION_B, () => 0.24)
    })
  },
  {
    file: "OptionC.dc.html",
    html: page({
      name: "Option C — Strength carries commitment",
      subtitle: "Option A's hues, but the fill varies by kind: obligations paint at 30% (Class, Work, Studying, Exercise, Dating, Networking, Waste), ordinary activities at 18%, and routine glue — transit, meals, sleep, health admin — stays near-white at 8%. A glance shows where the fixed points of the day are.",
      tradeoff: "Tradeoff: this is the direct answer to the wall-of-colour worry — a week only gets loud where you were actually committed. But Transportation is deliberately faint here, so it reads as background rather than as something you can pick out at a glance.",
      body: optionBody(OPTION_C, tieredFill)
    })
  }
];

for (const board of BOARDS) {
  writeFileSync(join(here, board.file), board.html);
  console.log(`wrote ${board.file}`);
}

const W = 920;
const H = 1220;
writeFileSync(join(here, "canvas.json"), JSON.stringify({
  artboards: [
    { file: "Main.dc.html", title: "Why they blend", x: 0, y: 0, w: W, h: 1560 },
    { file: "OptionA.dc.html", title: "Option A — Semantic families", x: 980, y: 0, w: W, h: H },
    { file: "OptionB.dc.html", title: "Option B — Contrast first", x: 1960, y: 0, w: W, h: H },
    { file: "OptionC.dc.html", title: "Option C — Strength carries commitment", x: 2940, y: 0, w: W, h: H }
  ],
  annotations: [
    { id: "how-to-read", x: 0, y: -180, w: 360, text: "Start at \"Why they blend\" — the ramps there show that hue is invisible below about 20% fill, whatever colours you pick.\nThen compare the three options on the same Tuesday. The test: can you tell train → class → train → work apart without reading the titles?" }
  ],
  launch: { view: "canvas" }
}, null, 2));
console.log("wrote canvas.json");
