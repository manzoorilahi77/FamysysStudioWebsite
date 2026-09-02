// Prints the contrast ratio of every colour pairing the site renders, with a pass/fail
// against the WCAG floor that pairing has to clear.
//
//   npm run check-colours
//
// Exits 1 if any pairing under IN USE fails. The AVOIDED table never gates the exit code:
// those rows exist so the reason a colour is kept off a ground is visible as a number
// rather than as a claim in a comment.
//
// Floors, from WCAG 2.2:
//   text   4.5:1  running copy, links, labels — anything under ~24px
//   large  3.0:1  headings from ~24px bold / ~30px regular up
//   ui     3.0:1  borders and icons that carry meaning, focus rings, form outlines
//   decor  1.0:1  washes, watermarks, hairlines — reported, never enforced
//
// Every alpha colour is composited over its real ground before measuring, because
// `ink-70` on cream is not `ink`, and the ratio of what the eye receives is the only one
// that counts.

import { colors } from "../src/shared/design/colors.ts";
import { contrastOn, flatten } from "../src/shared/design/colorMath.ts";
import { canvasOpacity, color, colorDerived, inkOpacity } from "../src/shared/design/tokens.ts";

const FLOORS = { text: 4.5, large: 3, ui: 3, decor: 1 };

const GROUNDS = {
  "page background (cream)": colors.pageBackground,
  "section warm (deeper cream)": colors.sectionWarm,
  "card background (white)": colors.cardBackground,
  "dark background (navy)": colors.darkBackground,
  "section alt (lighter navy)": colors.sectionAlt,
  "accent primary fill": colors.accentPrimary,
  "accent warm fill": colors.accentWarm,
  "accent highlight fill": colors.accentHighlight,
};

/** [ground, foreground, role, what it is] — the pairings the markup actually produces. */
const IN_USE = [
  // --- the two light grounds. Everything that holds on cream must hold on the warm one.
  ["page background (cream)", color.textOnLight, "text", "headings and full-ink copy"],
  ["page background (cream)", colorDerived.bodyOnLight, "text", "running body and lead"],
  ["page background (cream)", colors.accentPrimary, "text", "links and eyebrows"],
  ["page background (cream)", inkOpacity[70], "text", "muted list and FAQ copy"],
  // The warm accent is a FILL on light grounds, never a line or a word: measured against
  // cream it is 2.495:1, under even the 3:1 non-text floor. Filled, with navy on it, it
  // clears the text floor comfortably — see "accent warm fill" below.
  ["page background (cream)", colorDerived.accentWarmWash, "decor", "warm chip resting wash"],
  ["page background (cream)", inkOpacity[12], "decor", "seam hairline"],
  ["page background (cream)", colorDerived.cardTintOnCanvas, "decor", "cell hover, flat lift"],
  ["page background (cream)", colorDerived.serviceNumeralOnCanvas, "decor", "watermark numeral"],

  ["section warm (deeper cream)", color.textOnLight, "text", "headings and full-ink copy"],
  ["section warm (deeper cream)", colorDerived.bodyOnLight, "text", "running body and lead"],
  ["section warm (deeper cream)", colors.accentPrimary, "text", "links and eyebrows"],
  ["section warm (deeper cream)", inkOpacity[70], "text", "muted list and FAQ copy"],
  ["section warm (deeper cream)", colors.cardBackground, "decor", "card lifted off the ground"],
  ["section warm (deeper cream)", inkOpacity[12], "decor", "seam hairline"],

  // --- white cards, which sit on both light grounds
  ["card background (white)", color.textOnLight, "text", "card heading"],
  ["card background (white)", colorDerived.bodyOnLight, "text", "card body"],
  ["card background (white)", colors.accentPrimary, "text", "card link"],
  ["card background (white)", inkOpacity[12], "decor", "card border"],

  // --- the two dark grounds
  ["dark background (navy)", colors.textOnDark, "text", "headings and eyebrows"],
  ["dark background (navy)", canvasOpacity[80], "text", "running body and lead"],
  ["dark background (navy)", colors.accentOnDark, "text", "accent copy, borders, focus ring"],
  ["dark background (navy)", colors.accentHighlight, "text", "the one highlight moment"],
  ["dark background (navy)", colors.accentWarm, "large", "process numerals and status"],
  ["dark background (navy)", canvasOpacity[16], "decor", "hairline"],

  ["section alt (lighter navy)", colors.textOnDark, "text", "headings and eyebrows"],
  ["section alt (lighter navy)", canvasOpacity[80], "text", "running body and lead"],
  // On the lighter navy the lightened accent measures 4.120:1 — over the 3:1 floor a
  // border or a focus ring has to clear, under the 4.5:1 a word does. So on this ground
  // it carries accent ROLES only, and accent copy falls back to the cream.
  ["section alt (lighter navy)", colors.accentOnDark, "ui", "borders and focus ring"],
  ["section alt (lighter navy)", colors.accentHighlight, "text", "the one highlight moment"],
  ["section alt (lighter navy)", colors.accentWarm, "large", "process numerals and status"],
  ["section alt (lighter navy)", colorDerived.hairlineOnSectionAlt, "decor", "hairline"],

  // --- accent fills, where the accent is the ground and something has to read on it
  ["accent primary fill", colors.pageBackground, "text", "primary button label"],
  ["accent primary fill", colors.cardBackground, "text", "accent panel copy"],
  ["accent highlight fill", colors.darkBackground, "text", "highlight chip label"],
  ["accent warm fill", colors.darkBackground, "text", "warm panel and chip label"],
];

/** Pairings deliberately not used. Shown so the number is on record, not the assertion. */
const AVOIDED = [
  ["page background (cream)", colors.accentHighlight, "text", "highlight on cream"],
  ["page background (cream)", colors.accentOnDark, "text", "the dark-ground accent on cream"],
  ["dark background (navy)", colors.accentPrimary, "text", "brand blue on navy"],
  ["accent warm fill", colors.pageBackground, "text", "cream label on the warm accent"],
  ["accent highlight fill", colors.pageBackground, "text", "cream label on the highlight"],
  ["accent warm fill", colors.cardBackground, "text", "white label on the warm accent"],
  ["section alt (lighter navy)", colors.accentOnDark, "text", "accent COPY on the lighter navy"],
];

const COLUMN = { ground: 28, on: 11, role: 6, ratio: 9, floor: 7, verdict: 6 };
const pad = (value, width) => String(value).padEnd(width);
const ratioOf = (foreground, ground) => contrastOn(foreground, ground);

const row = (groundName, foreground, role, note) => {
  const ground = GROUNDS[groundName];
  const ratio = ratioOf(foreground, ground);
  const floor = FLOORS[role];
  const passes = ratio >= floor;
  return {
    groundName,
    foreground,
    role,
    note,
    ratio,
    floor,
    passes,
    flat: flatten(foreground, ground),
  };
};

const header = () =>
  [
    pad("ground", COLUMN.ground),
    pad("on", COLUMN.on),
    pad("role", COLUMN.role),
    pad("ratio", COLUMN.ratio),
    pad("floor", COLUMN.floor),
    pad("", COLUMN.verdict),
    "what it is",
  ].join(" ");

const line = (entry) =>
  [
    pad(entry.groundName, COLUMN.ground),
    pad(entry.flat, COLUMN.on),
    pad(entry.role, COLUMN.role),
    pad(`${entry.ratio.toFixed(3)}:1`, COLUMN.ratio),
    pad(entry.role === "decor" ? "—" : `${entry.floor.toFixed(1)}:1`, COLUMN.floor),
    pad(entry.role === "decor" ? "info" : entry.passes ? "PASS" : "FAIL", COLUMN.verdict),
    entry.note,
  ].join(" ");

const table = (title, rows) => {
  console.log(`\n${title}`);
  console.log("-".repeat(header().length));
  console.log(header());
  let lastGround = "";
  for (const entry of rows) {
    if (entry.groundName !== lastGround && lastGround !== "") console.log("");
    lastGround = entry.groundName;
    console.log(line(entry));
  }
};

console.log("Palette — src/shared/design/colors.ts");
console.log("-".repeat(48));
for (const [name, value] of Object.entries(colors)) {
  console.log(`${pad(name, 18)} ${value}`);
}

const inUse = IN_USE.map((entry) => row(...entry));
const avoided = AVOIDED.map((entry) => row(...entry));

table("IN USE — these gate the exit code", inUse);
table("AVOIDED — reported, never enforced", avoided);

const failures = inUse.filter((entry) => entry.role !== "decor" && !entry.passes);

console.log("");
if (failures.length === 0) {
  console.log(
    `All ${inUse.filter((entry) => entry.role !== "decor").length} enforced pairings pass.`,
  );
} else {
  for (const entry of failures) {
    console.error(
      `FAIL  ${entry.note} — ${entry.flat} on ${GROUNDS[entry.groundName]} is ` +
        `${entry.ratio.toFixed(3)}:1, floor ${entry.floor.toFixed(1)}:1`,
    );
  }
  console.error(`\n${failures.length} pairing(s) below their floor. See docs/changing-colours.md.`);
  process.exit(1);
}
