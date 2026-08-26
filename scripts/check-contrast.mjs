import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSS_PATH = path.join(__dirname, "..", "src", "pages", "index.css");

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

/**
 * Read the shipped colour tokens straight out of :root in the real CSS file,
 * rather than keeping a second hand-maintained copy here that can silently
 * drift from what actually ships.
 */
const readTokens = () => {
  const css = readFileSync(CSS_PATH, "utf8");
  const rootMatch = css.match(/:root\s*{([^}]*)}/);
  if (!rootMatch) {
    throw new Error(`could not find a ":root { ... }" block in ${CSS_PATH}`);
  }

  const tokens = {};
  for (const declaration of rootMatch[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    tokens[declaration[1]] = declaration[2].trim();
  }
  return tokens;
};

const need = (tokens, name) => {
  const value = tokens[name];
  if (!value) {
    throw new Error(
      `${CSS_PATH} :root has no "${name}" — check-contrast.mjs needs it to run this check`
    );
  }
  return value;
};

let GROUND, RAISED, TEXT, TEXT_MUTED, SAND, K8S_BLUE;
try {
  const tokens = readTokens();
  GROUND = need(tokens, "--ground");
  RAISED = need(tokens, "--ground-raised");
  TEXT = need(tokens, "--text");
  TEXT_MUTED = need(tokens, "--text-muted");
  SAND = need(tokens, "--sand");
  K8S_BLUE = need(tokens, "--k8s-blue");
} catch (err) {
  console.error(`FAIL: ${err.message}`);
  process.exit(1);
}

const checks = [
  ["body text on ground", TEXT, GROUND, 4.5],
  ["muted text on ground", TEXT_MUTED, GROUND, 4.5],
  ["sand link on ground", SAND, GROUND, 4.5],
  ["heading on raised panel", TEXT, RAISED, 4.5],
  ["year (large text) on ground", SAND, GROUND, 3],
  ["blue rule (non-text) on ground", K8S_BLUE, GROUND, 3]
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
