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
  "page ground": colors.pageBackground,
  "section warm": colors.sectionWarm,
  "card ground": colors.cardBackground,
  "dark ground": colors.darkBackground,
  "section alt": colors.sectionAlt,
  "accent primary fill": colors.accentPrimary,
  "accent warm fill": colors.accentWarm,
  "accent highlight fill": colors.accentHighlight,
  "header ground": colorDerived.headerGround,
  "primary button on dark": colors.accentOnDark,
  "primary button on dark, hovered": colorDerived.primaryButtonHoverOnDark,
  "raised card": colors.cardBackground,
  // Two composited grounds. The chip wash and the entry state of the alternate navy are
  // both transparent, so what sits on them is measured against what they resolve to.
  "warm chip wash": flatten(colorDerived.accentWarmWash, colors.pageBackground),
  "alternate ground, entering": flatten(colorDerived.sectionAltEntering, colors.pageBackground),
};

/** [ground, foreground, role, what it is] — the pairings the markup actually produces. */
const IN_USE = [
  // --- the two light grounds. Everything that holds on cream must hold on the warm one.
  ["page ground", color.textOnLight, "text", "headings and full-ink copy"],
  ["page ground", colorDerived.bodyOnLight, "text", "running body and lead"],
  ["page ground", colors.accentPrimary, "text", "links and eyebrows"],
  ["page ground", inkOpacity[70], "text", "muted list and FAQ copy"],
  // The warm accent is a FILL on light grounds, never a line or a word: measured against
  // cream it is 2.495:1, under even the 3:1 non-text floor. Filled, with navy on it, it
  // clears the text floor comfortably — see "accent warm fill" below.
  ["page ground", colorDerived.accentWarmWash, "decor", "category chip wash"],
  ["page ground", colors.sectionWarm, "decor", "the alternate light ground, as a step"],
  ["page ground", inkOpacity[12], "decor", "seam hairline"],
  ["page ground", colorDerived.cardTintOnCanvas, "decor", "cell hover, flat lift"],
  ["page ground", colorDerived.serviceNumeralOnCanvas, "decor", "watermark numeral"],

  ["section warm", color.textOnLight, "text", "headings and full-ink copy"],
  ["section warm", colorDerived.bodyOnLight, "text", "running body and lead"],
  ["section warm", colors.accentPrimary, "text", "links and eyebrows"],
  ["section warm", inkOpacity[70], "text", "muted list and FAQ copy"],
  ["section warm", colors.cardBackground, "decor", "card lifted off the ground"],
  ["section warm", colorDerived.accentWarmWash, "decor", "category chip wash"],
  ["section warm", inkOpacity[12], "decor", "seam hairline"],

  // --- white cards, which sit on both light grounds
  ["card ground", color.textOnLight, "text", "card heading"],
  ["card ground", colorDerived.bodyOnLight, "text", "card body"],
  ["card ground", colors.accentPrimary, "text", "card link"],
  ["card ground", inkOpacity[12], "decor", "card border"],

  // --- the two dark grounds
  ["dark ground", colors.textOnDark, "text", "headings and eyebrows"],
  ["dark ground", canvasOpacity[80], "text", "running body and lead"],
  ["dark ground", colors.accentOnDark, "text", "accent copy, borders, focus ring"],
  ["dark ground", colors.accentHighlight, "text", "the one highlight moment"],
  ["dark ground", colors.accentWarm, "large", "process numerals and status"],
  ["dark ground", canvasOpacity[16], "decor", "hairline"],
  ["dark ground", colors.sectionAlt, "decor", "the alternate dark ground, as a step"],
  ["dark ground", colors.cardBackground, "ui", "Differentiator card panel edge"],
  ["dark ground", colorDerived.sectionAltEntering, "decor", "alternate ground, entering"],

  ["section alt", colors.textOnDark, "text", "headings and eyebrows"],
  ["section alt", canvasOpacity[80], "text", "running body and lead"],
  // Held to the 3:1 UI floor rather than the 4.5:1 text one. The lightened accent is not
  // guaranteed to clear 4.5:1 on the ALTERNATE dark ground for every palette — under the
  // navy this file shipped with it measured 4.120:1 — so the role this table enforces is
  // the one that always has to hold: borders, underlines and focus rings. Accent COPY on
  // this ground is checked in AVOIDED, where its number is visible either way.
  ["section alt", colors.accentOnDark, "ui", "borders, underlines and focus ring"],
  ["section alt", colors.accentHighlight, "text", "the one highlight moment"],
  ["section alt", colors.accentWarm, "large", "process numerals and status"],
  ["section alt", colorDerived.hairlineOnSectionAlt, "decor", "hairline"],
  ["section alt", colors.cardBackground, "ui", "card panel edge"],

  // --- accent fills, where the accent is the ground and something has to read on it
  ["accent primary fill", colors.pageBackground, "text", "primary button label"],
  ["accent primary fill", colors.cardBackground, "text", "Differentiator accent panel copy"],
  ["accent highlight fill", colors.darkBackground, "text", "closing CTA label, hovered"],
  ["accent warm fill", colors.darkBackground, "text", "warm panel, status marker label"],

  // --- the fixed header bar, which takes its own ground rather than a section's
  ["header ground", colors.textOnDark, "text", "wordmark and nav links"],
  ["header ground", canvasOpacity[80], "text", "nav link at rest"],
  ["header ground", colors.accentOnDark, "ui", "nav underline, focus ring"],
  // The bar's CTA is the light primary variant on a dark bar, at the brief's direction, so
  // its fill is the primary accent — which is chosen for legibility on LIGHT grounds and is
  // not guaranteed to clear 3:1 against a near-black bar. `.header-cta-primary` therefore
  // draws the boundary with a hairline in the lightened accent, and that hairline is what
  // this row enforces. The fill's own number is in AVOIDED, which is where the hairline's
  // reason for existing should be visible.
  ["header ground", colors.accentOnDark, "ui", "the bar CTA's hairline, as a boundary"],

  // --- the primary control on a dark section, filled with the lightened accent
  ["dark ground", colors.accentOnDark, "ui", "primary button fill, as a shape"],
  ["primary button on dark", colors.textOnLight, "text", "primary button label"],
  ["primary button on dark, hovered", colors.textOnLight, "text", "the same label, hovered"],

  // --- alternating card fills inside one grid
  ["raised card", colors.textOnLight, "text", "raised card heading"],
  ["raised card", colorDerived.bodyOnLight, "text", "raised card body"],
  ["raised card", colors.accentPrimary, "text", "raised card link"],
  ["warm chip wash", inkOpacity[70], "text", "category chip label"],
  ["warm chip wash", color.textOnLight, "text", "category chip, full ink"],
  ["alternate ground, entering", colors.textOnDark, "text", "headings mid-fade"],
  ["alternate ground, entering", canvasOpacity[80], "text", "body copy mid-fade"],
];

/** Pairings deliberately not used. Shown so the number is on record, not the assertion. */
const AVOIDED = [
  ["page ground", colors.accentHighlight, "text", "the highlight as text on the page ground"],
  ["page ground", colors.accentOnDark, "text", "the dark-ground accent on the page ground"],
  ["dark ground", colors.accentPrimary, "text", "the light-ground accent on the dark ground"],
  [
    "accent warm fill",
    colors.pageBackground,
    "text",
    "the page ground as a label on the warm accent",
  ],
  [
    "accent highlight fill",
    colors.pageBackground,
    "text",
    "the page ground as a label on the highlight",
  ],
  [
    "accent warm fill",
    colors.cardBackground,
    "text",
    "the card ground as a label on the warm accent",
  ],
  ["section alt", colors.accentOnDark, "text", "accent COPY on the alternate dark ground"],
  [
    "alternate ground, entering",
    colors.accentOnDark,
    "text",
    "accent copy mid-fade — the reason a dark section carrying accent words sets fade={false}",
  ],
  ["dark ground", colors.accentPrimary, "ui", "Differentiator accent panel edge"],
  [
    "header ground",
    colors.accentPrimary,
    "ui",
    "the bar CTA's fill — the reason it carries a hairline",
  ],
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
