// Shared palette + chip-rendering helpers for the event-color canvas.
// Every chip here reproduces the real anatomy from styles.css and the real
// text-contrast rule from readableEventColors() in app.js, so a mockup chip
// paints exactly what the app would paint at the same fill strength.

export const LIGHT = { panel: "#fffefa", bg: "#f6f5ef", line: "#d6d8d2", ink: "#1d2528", muted: "#657072" };
export const DARK = { panel: "#182121", bg: "#111718", line: "#344342", ink: "#eef4f2", muted: "#a9b7b3" };

export const LABELS = {
  Z: "Sleep", G: "Family", F: "Friends", D: "Dating", S: "Studying", W: "Work",
  B: "Productive", A: "Hobbies &amp; Skills", R: "Relaxation", E: "Exercise", H: "Health",
  X: "Waste", V: "Transportation", C: "Class", Q: "Daily Necessities",
  T: "Travel / exploring", N: "Networking"
};

// mix(a, b, p) == CSS color-mix(in srgb, a p%, b) == app.js mixHex(a, b, 1 - p).
export function mix(hex, base, p) {
  const parse = (x) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16));
  const a = parse(hex);
  const b = parse(base);
  return "#" + a.map((v, i) => Math.round(v * p + b[i] * (1 - p)).toString(16).padStart(2, "0")).join("");
}

function luminance(hex) {
  const parse = (x) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16));
  const [r, g, b] = parse(hex).map((v) => {
    const n = v / 255;
    return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

// The same choice readableEventColors() makes: dark or light text, whichever
// wins on contrast against the fill the chip actually paints.
export function chipInk(color, theme, fill) {
  const background = mix(color, theme.panel, fill);
  const dark = mix("#000000", background, 0.9);
  const light = mix("#ffffff", background, 0.86);
  const text = contrast(background, dark) >= contrast(background, light) ? dark : light;
  return { background, text, muted: mix(text, background, 0.34) };
}

// fill: how much category colour the body of the chip shows. bar: the width of
// the full-strength leading edge. The app today is fill 0.09 / bar 4px.
export function chipStyle(color, theme, { fill = 0.09, bar = 4 } = {}) {
  const { background, text } = chipInk(color, theme, fill);
  const border = mix(color, theme.line, Math.min(1, fill * 2));
  return `border:1px solid ${border};border-left:${bar}px solid ${color};border-radius:6px;background:${background};color:${text};`;
}
