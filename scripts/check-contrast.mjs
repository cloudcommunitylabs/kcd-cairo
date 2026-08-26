// WCAG 2.1 relative luminance and contrast ratio.
const channel = (eight) => {
  const s = eight / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex) => {
  const [r, g, b] = hex
    .replace("#", "")
    .match(/../g)
    .map((pair) => channel(parseInt(pair, 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const GROUND = "#0b1016";
const RAISED = "#121a24";

const checks = [
  ["body text on ground", "#f2f5f8", GROUND, 4.5],
  ["muted text on ground", "#9aa7b4", GROUND, 4.5],
  ["sand link on ground", "#e0a458", GROUND, 4.5],
  ["heading on raised panel", "#f2f5f8", RAISED, 4.5],
  ["year (large text) on ground", "#e0a458", GROUND, 3],
  ["blue rule (non-text) on ground", "#326ce5", GROUND, 3]
];

let failed = 0;
for (const [label, fg, bg, floor] of checks) {
  const value = ratio(fg, bg);
  const ok = value >= floor;
  if (!ok) failed += 1;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${value.toFixed(2)}:1  (needs ${floor}:1)  ${label}`
  );
}

if (failed > 0) {
  console.error(`\n${failed} contrast check(s) failed`);
  process.exit(1);
}
console.log("\nAll contrast checks pass");
