// Writes the colour half of globals.css's `@theme` block from src/shared/design/tokens.ts,
// which in turn derives everything from src/shared/design/colors.ts.
//
// The CSS used to be a hand-maintained mirror of the TypeScript, with a comment asking
// whoever edited one to remember the other. Two files that must agree and are kept in
// step by good intentions do not stay in step. This makes the CSS an output.
//
//   node scripts/generate-color-css.mjs           write src/app/colors.generated.css
//   node scripts/generate-color-css.mjs --check   exit 1 if the file on disk is stale
//
// Wired to predev/prebuild, so nobody has to remember to run it, and to `lint` in --check
// mode so a stale committed file fails CI rather than shipping.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { color, canvasOpacity, colorDerived, inkOpacity } from "../src/shared/design/tokens.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const OUTPUT_PATH = path.join(ROOT, "src", "app", "colors.generated.css");

/**
 * CSS custom property name -> value, in the order they should appear. Tailwind v4 turns
 * every `--color-*` here into a utility (`bg-section-alt`, `text-accent-warm`, …), so
 * this list is also the set of colour classes the markup is allowed to use.
 */
const groups = [
  {
    title: "Grounds and text. Bases from colors.ts; everything under them is a tint of one.",
    vars: {
      canvas: color.canvas,
      ink: color.ink,
      card: color.card,
      graphite: color.graphite,
      "text-on-dark": color.textOnDark,
    },
  },
  {
    title:
      "Section grounds. Consecutive sections of the same family alternate onto these,\n   so a run of five cream or three navy sections reads as separate panels rather\n   than one sheet. See THE SECTION SEAM in globals.css.",
    vars: {
      "section-alt": color.sectionAlt,
      "section-warm": color.sectionWarm,
      "header-ground": colorDerived.headerGround,
    },
  },
  {
    title:
      "Accents. `accent` is the brand blue and carries the primary role everywhere.\n   `accent-on-dark` is the lightened blue navy needs. `accent-warm` is secondary\n   emphasis — chips, status markers, process numerals. `accent-highlight` is loud\n   and rationed to one use per page.",
    vars: {
      accent: color.accent,
      "accent-on-dark": color.accentOnDark,
      "accent-warm": color.accentWarm,
      "accent-highlight": color.accentHighlight,
    },
  },
  {
    title: "Borders.",
    vars: {
      hairline: color.hairline,
      "hairline-on-dark": color.hairlineOnDark,
    },
  },
  {
    title: "The dark ground at each alpha step — borders, washes and muted text on light grounds.",
    vars: Object.fromEntries(
      Object.entries(inkOpacity).map(([step, value]) => [`ink-${step}`, value]),
    ),
  },
  {
    title: "The light ground at the same steps, for dark surfaces.",
    vars: Object.fromEntries(
      Object.entries(canvasOpacity).map(([step, value]) => [`canvas-${step}`, value]),
    ),
  },
  {
    title:
      "Derived roles. Each is a base put through colorMath — see `colorDerived` in\n   tokens.ts for what the shift means and why it is that size.",
    vars: {
      "graphite-70": colorDerived.bodyOnLight,
      "card-tint": colorDerived.cardTintOnCanvas,
      "card-tint-deep": colorDerived.cardTintDeepOnCanvas,
      "service-numeral": colorDerived.serviceNumeralOnCanvas,
      "primary-button-hover": colorDerived.primaryButtonHover,
      "primary-button-hover-on-dark": colorDerived.primaryButtonHoverOnDark,
      "accent-8": colorDerived.accentWash,
      "accent-warm-wash": colorDerived.accentWarmWash,
      "hairline-on-section-alt": colorDerived.hairlineOnSectionAlt,
      "section-alt-entering": colorDerived.sectionAltEntering,
    },
  },
];

const HEADER = `/* GENERATED FILE — DO NOT EDIT.
   ---------------------------------------------------------------------------
   Written by scripts/generate-color-css.mjs from src/shared/design/tokens.ts,
   which derives every value below from the fourteen bases in
   src/shared/design/colors.ts.

   To change a colour, edit src/shared/design/colors.ts and run \`npm run dev\`
   or \`npm run build\` — both regenerate this file. Editing it by hand is
   pointless: the next build overwrites it, and \`npm run lint\` fails while it
   disagrees with colors.ts. See docs/changing-colours.md. */

@theme {`;

const render = () => {
  const body = groups
    .map(({ title, vars }) => {
      const declarations = Object.entries(vars)
        .map(([name, value]) => `  --color-${name}: ${value.toLowerCase()};`)
        .join("\n");
      return `  /* ${title} */\n${declarations}`;
    })
    .join("\n\n");
  return `${HEADER}\n${body}\n}\n`;
};

/**
 * The generated file is not the only CSS in the app. This catches a hex written by hand
 * into globals.css, where it would be a colour that no longer follows colors.ts — the CSS
 * half of the rule ESLint enforces over the TypeScript. Comments are stripped first:
 * globals.css explains several ratios by naming the colour they were measured on, and a
 * hex inside a comment paints nothing.
 */
const HAND_WRITTEN_CSS = [path.join(ROOT, "src", "app", "globals.css")];
const HEX_IN_CSS = /#[0-9a-fA-F]{3,8}/;

const strayHexInCss = () =>
  HAND_WRITTEN_CSS.flatMap((file) =>
    readFileSync(file, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split(/\r?\n/)
      .map((line, index) => ({ file, line: index + 1, text: line.trim() }))
      .filter(({ text }) => HEX_IN_CSS.test(text)),
  );

const expected = render();
const isCheck = process.argv.includes("--check");

if (isCheck) {
  let actual = "";
  try {
    actual = readFileSync(OUTPUT_PATH, "utf8");
  } catch {
    actual = "";
  }
  if (actual.replace(/\r\n/g, "\n") !== expected) {
    console.error(
      "[generate-color-css] src/app/colors.generated.css is out of date.\n" +
        "  Someone changed src/shared/design/colors.ts (or tokens.ts) without regenerating.\n" +
        "  Fix: node scripts/generate-color-css.mjs",
    );
    process.exit(1);
  }
  const stray = strayHexInCss();
  if (stray.length > 0) {
    for (const { file, line, text } of stray) {
      console.error(`${path.relative(ROOT, file)}:${line}  hex colour written by hand: ${text}`);
    }
    console.error(
      "[generate-color-css] No hex colours outside src/shared/design/colors.ts.\n" +
        "  Add the colour there, give it a role in tokens.ts, and use the generated\n" +
        "  --color-* variable (or its Tailwind class) here instead.",
    );
    process.exit(1);
  }
  console.log(
    "[generate-color-css] colors.generated.css matches colors.ts, no stray hex in globals.css",
  );
} else {
  writeFileSync(OUTPUT_PATH, expected, "utf8");
  console.log(`[generate-color-css] wrote ${path.relative(ROOT, OUTPUT_PATH)}`);
}
