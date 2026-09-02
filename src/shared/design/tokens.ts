// COLOUR STARTS IN ./colors.ts. Nothing here names a colour; everything here is that
// file's fourteen bases put through ./colorMath. Change a base there and every tint,
// hover fill, hairline and CSS variable below moves with it — including the `@theme`
// block in src/app/globals.css, which scripts/generate-color-css.mjs writes from this
// module rather than anyone maintaining a second copy by hand.
//
// Run `npm run check-colours` after any change: it prints the contrast ratio of every
// pairing the site actually renders, with a pass/fail against the WCAG floor each one
// has to clear. See docs/changing-colours.md.

// The `.ts` extensions are load-bearing: scripts/generate-color-css.mjs imports this
// module with plain `node`, which resolves ESM specifiers literally and will not guess an
// extension. `allowImportingTsExtensions` in tsconfig.json permits it on the TypeScript
// side, and webpack resolves an exact filename first, so the app build is unaffected.
import { colors } from "./colors.ts";
import { mix, withAlpha } from "./colorMath.ts";

/** Alpha steps, as percentages. Two ramps share them so the ladder reads the same on both grounds. */
const INK_STEPS = [4, 6, 8, 12, 20, 40, 60, 70, 90] as const;
const CANVAS_STEPS = [4, 10, 16, 40, 60, 80] as const;

/** How far the accent moves toward the dark ground on a primary button's hover. */
const BUTTON_HOVER_SHIFT = 0.14;
/** How far the cream deepens toward graphite for the same button on a dark section. */
const BUTTON_HOVER_ON_DARK_SHIFT = 0.07;
/** Opacity of the warm accent's wash. See `accentWarmWash` for why it is this high. */
const WARM_WASH_ALPHA = 22;

// The three light navies, as distances from `darkBackground` toward `cardBackground`.
// Mixing toward WHITE rather than toward the cream is the whole reason they exist as
// their own values: the cream is warm (B is its LOWEST channel), so blending the navy
// into it cannot produce a blue-leaning tint until roughly 21% — and by then the mix has
// gone dark and desaturated. Mixed toward white, each keeps B > G > R.
const CARD_TINT_SHIFT = 0.87; // hover fill, the flat lift across the whole cell
const CARD_TINT_DEEP_SHIFT = 0.82; // hover fill, the radial peak at the top-left corner
const SERVICE_NUMERAL_SHIFT = 0.755; // the watermark numeral, one step deeper again

type Ramp<Steps extends readonly number[]> = { readonly [K in Steps[number]]: string };

const ramp = <const Steps extends readonly number[]>(base: string, steps: Steps): Ramp<Steps> =>
  Object.fromEntries(steps.map((step) => [step, withAlpha(base, step)])) as Ramp<Steps>;

/** The palette as the site names it. Every value is a base from colors.ts or a tint of one. */
export const color = {
  canvas: colors.pageBackground,
  ink: colors.darkBackground,
  card: colors.cardBackground,
  graphite: colors.textMuted,
  accent: colors.accentPrimary,
  accentOnDark: colors.accentOnDark,
  accentWarm: colors.accentWarm,
  accentHighlight: colors.accentHighlight,
  sectionAlt: colors.sectionAlt,
  sectionWarm: colors.sectionWarm,
  textOnLight: colors.textOnLight,
  textOnDark: colors.textOnDark,
  hairline: withAlpha(colors.darkBackground, 8),
  hairlineOnDark: withAlpha(colors.pageBackground, 10),
} as const;

/** The navy at each alpha step — borders, washes and muted text on light grounds. */
export const inkOpacity = ramp(colors.darkBackground, INK_STEPS);

/** The cream at each alpha step — the same ladder, for dark grounds. */
export const canvasOpacity = ramp(colors.pageBackground, CANVAS_STEPS);

export const colorDerived = {
  // Eyebrows are asymmetric on purpose: the accent clears the 4.5:1 text floor on cream
  // (measured by check-colours), but on navy it fails even the 3:1 non-text floor, so the
  // dark side uses the cream text colour and the lightened accent covers accent ROLES —
  // borders, focus rings — rather than accent-coloured words.
  eyebrowOnLight: colors.accentPrimary,
  eyebrowOnDark: colors.textOnDark,
  accentOnDark: colors.accentOnDark,

  /** Running body and lead copy. Graphite at 70% on light, cream at 80% on dark. */
  bodyOnLight: withAlpha(colors.textMuted, 70),
  bodyOnDark: withAlpha(colors.textOnDark, 80),

  primaryButtonHover: mix(colors.accentPrimary, colors.darkBackground, BUTTON_HOVER_SHIFT),
  primaryButtonHoverOnDark: mix(
    colors.pageBackground,
    colors.textMuted,
    BUTTON_HOVER_ON_DARK_SHIFT,
  ),

  cardTintOnCanvas: mix(colors.darkBackground, colors.cardBackground, CARD_TINT_SHIFT),
  cardTintDeepOnCanvas: mix(colors.darkBackground, colors.cardBackground, CARD_TINT_DEEP_SHIFT),
  serviceNumeralOnCanvas: mix(colors.darkBackground, colors.cardBackground, SERVICE_NUMERAL_SHIFT),

  /** An 8% accent wash — the resting fill of an accent-tinted chip on a light ground. */
  accentWash: withAlpha(colors.accentPrimary, 8),
  /**
   * The warm accent as a wash, for the category chips. 22% rather than the accent's 8%
   * because the warm accent is close to the cream in luminance and a lighter wash simply
   * does not appear: at 12% it separates from the ground by 1.141:1, at 22% by 1.228:1,
   * which is the same order as the section seam's own hairline. Muted list copy still
   * clears the text floor on it at 4.748:1.
   */
  accentWarmWash: withAlpha(colors.accentWarm, WARM_WASH_ALPHA),
  /** Hairline on the alternate navy — the cream ramp again, since the ground is still dark. */
  hairlineOnSectionAlt: withAlpha(colors.pageBackground, 16),
  /**
   * The alternate navy's entry state. A dark section settles its background as it comes
   * into view, from 90% of its own ground to the full value; the navy has `ink-90` for
   * that and the alternate ground needs the same step of its own. Cream text holds at
   * 7.879:1 over it and the running body at 5.722:1, so nothing is unreadable part-way
   * through. Accent copy is NOT safe on it (3.145:1) — which is the existing rule that a
   * dark section carrying accent words switches the fade off rather than working around it.
   */
  sectionAltEntering: withAlpha(colors.sectionAlt, 90),
} as const;

export const type = {
  sans: "var(--font-jost)", // brand — famysys.com --font-jost, loaded via next/font/google
  // DEVIATION (brand deviation 5, PENDING MANAGER APPROVAL): the brand rules specify Jost
  // and a fallback stack, no second typeface. Instrument Serif Italic is a display accent
  // only, reachable exclusively through the `Accent` presentation component.
  displayAccent: "var(--font-display-accent)",
  // Serif italic reads optically smaller than Jost at the same px, so accented words are
  // set 5% up. Measured against the surrounding Jost cap-height, not guessed.
  displayAccentScale: 1.05,
} as const;

// DEVIATION (fidelity-loop pass 1, gap #2): famysys.com's own display sizes read quiet next to
// Superside's reference — its hero/section headings run dramatically larger relative to
// viewport. displayXl and displayL's preferred-value multipliers and ceilings are raised ~30%
// over the measured famysys.com values below; the mobile floors (the first clamp argument) are
// untouched on purpose, per the fidelity-loop brief. See docs spec §2.8.3 for the full log.
export const typeScale = {
  displayXl: {
    size: "clamp(clamp(1.875rem, 9.4vw, 2.125rem), min(5.7vw, 11.7svh), 6.25rem)",
    lineHeight: 1.02,
    letterSpacing: "-0.03em",
  },
  // THE HEADING STEP. Named `hero` because that is where it started — the hero headline
  // took its own step rather than displayXl: in a 46%-wide column
  // displayXl broke the client's 48-character headline onto five lines. This resolves to
  // ~52px at 1440, about 23 characters a line, so it holds two. See globals.css.
  // Every section heading takes it too now, in place of displayL and, for the closing CTA,
  // displayXl. Mirrored as `.text-heading` in globals.css, which is the name to use in markup.
  hero: { size: "clamp(1.9rem, 2.8vw, 2.6rem)", lineHeight: 1.08, letterSpacing: "-0.026em" },
  displayL: {
    size: "clamp(1.75rem, 3.85vw, 4.25rem)",
    lineHeight: 1.06,
    letterSpacing: "-0.026em",
  },
  displayM: { size: "clamp(1.5rem, 2.25vw, 2.5rem)", lineHeight: 1.18, letterSpacing: "-0.019em" },
  // DEVIATION (fidelity-loop pass 1, gap #7): §4.7 impact-metric figures need to dominate their
  // section the way Superside's do — roughly 3-4x displayM. No famysys.com precedent at this
  // scale; ceiling and preferred value are both new, floor kept comfortably above displayM's.
  metric: { size: "clamp(3.5rem, 9.5vw, 10rem)", lineHeight: 0.95, letterSpacing: "-0.032em" },
  displayS: {
    size: "clamp(1.1875rem, 1.45vw, 1.5rem)",
    lineHeight: 1.34,
    letterSpacing: "-0.013em",
  },
  lead: {
    size: "clamp(1.0625rem, 1.35vw, 1.3125rem)",
    lineHeight: 1.62,
    letterSpacing: "-0.008em",
  },
  body: { size: "1.0625rem", lineHeight: 1.62, letterSpacing: "-0.006em" },
  small: { size: "0.9375rem", lineHeight: 1.6 },
  eyebrow: { size: "0.6875rem", lineHeight: 1, letterSpacing: "0.2em", transform: "uppercase" },
} as const;

export const weight = {
  eyebrow: 600,
  heroHeadline: 600,
  display: 500,
  body: 400,
  emphasis: 500,
} as const;

export const radius = "0.25rem"; // measured — famysys.com --radius-sm, applied site-wide

// Vertical rhythm is deliberately uneven. Light sections run at the base measure;
// dark sections get noticeably more air so each one reads as a held breath rather
// than another row of the same page; the two standalone centred statements get the
// most of all, since the space around them is what makes the centring read as a
// decision instead of a default.
export const spacing = {
  section: "clamp(4.5rem, 10vh, 8.5rem)",
  sectionDark: "clamp(6.5rem, 14vh, 12rem)",
  statement: "clamp(8rem, 18vh, 15rem)",
  // THE SITE'S ONE GUTTER. The header bar, every section's Container and the footer all
  // take this value, which is what makes a section's first character sit directly under
  // the wordmark and its last pixel under the right edge of the header's CTA. It used to
  // top out at 5.5rem while the header ran on a flat 1.5rem, so content was inset from
  // the bar it was supposed to line up with — 4px at 390 and 64px at 1920.
  //
  // 3rem is the ceiling rather than 5.5rem because the header has to live inside it too:
  // the bar's contents measure 1128px at their tightest, and at the old ceiling the 80rem
  // shell left only 1104px, so the nav would have overflowed. At 3rem it has 1184px.
  gutter: "clamp(1.5rem, 4vw, 3rem)",
} as const;

export const container = { maxWidth: "80rem" } as const; // 1280px

export const focusRing = {
  color: color.accent,
  width: "2px",
  offset: "3px",
  radius: "2px",
} as const;

export const motion = {
  easing: {
    base: "cubic-bezier(0.22, 1, 0.36, 1)",
  },
  duration: {
    reduced: 120, // ms — reduced-motion collapses every transition to opacity-only at this duration
    fast: 180, // ms — card hover lift/border escalation (2.1d)
    hover: 200, // ms — signals layered ON TOP of the locked 180ms card base (§2 numeral, arrow)
    base: 320, // ms — §3's image/panel split change, and the standard reveal
    draw: 900, // ms — §4's hairline drawing itself left to right as the section enters
  },
  // Entry sequencing. Each section staggers on a different axis, so the steps are named
  // for the axis rather than shared: §2 reveals on the diagonal (row + column), §3 left to
  // right across the card row, §4 numeral after numeral as the drawn rule reaches each.
  stagger: {
    diagonalStepMs: 70,
    rowStepMs: 80,
    numeralStepMs: 140,
    // /creative-services: the two halves of a capability block's asymmetric split arrive
    // one after the other, and its deliverable rows run down the list.
    splitStepMs: 120,
    listStepMs: 50,
    // /how-we-work: a step block arrives in three parts — numeral, heading, then the
    // rest of the copy. Tighter than the split step, because these are three parts of
    // one column rather than the two halves of a split, and a 120ms gap between a
    // numeral and the heading directly under it reads as a stall.
    blockStepMs: 100,
  },
  // §2 What We Do — the service grid assembles itself rather than fading in as a block:
  // outer border, then internal hairlines, then cells, then numerals. Every `*DelayMs` is
  // the moment its beat STARTS, measured from the grid entering view; the two `*Ms` values
  // are durations. Verticals lead horizontals by one `hairlineStepMs` because a vertical
  // divides the row you are already reading across, so it lands where the eye is.
  gridDraw: {
    outerMs: 600,
    hairlineStepMs: 120,
    verticalDelayMs: 600,
    horizontalDelayMs: 720,
    ruleMs: 480,
    cellDelayMs: 840,
    cellMs: 320,
    numeralTrailMs: 200,
  },
  emphasis: {
    // /ways-to-work-with-us: the Custom Creative Partnership block is the page's
    // destination, not its fourth option, so it arrives slower than the three tiers
    // above it — the same reveal, given longer to land. A different effect would have
    // been a new effect; a different duration is emphasis.
    entryMs: 520,
  },
  parallax: {
    positioning: 24, // px — §4.5, scaled down from Superside's 40px per 2.7
  },
} as const;
