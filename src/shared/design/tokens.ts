// The four base colours below are the client's official brand palette, issued by the
// manager. They supersede the values previously measured off the live famysys.com CSS
// bundle. Everything else in this block is derived from them: the opacity ramps are the
// same alpha steps applied to the new bases, and each entry in `colorDerived` records the
// contrast ratio that justifies it. See
// docs/superpowers/specs/2026-08-28-famysys-studio-homepage-design.md §2 for the full audit.
// Mirror any change here into the matching CSS variable in src/app/globals.css.

export const color = {
  canvas: "#F4F1E8", // brand — Warm White
  ink: "#0B2C4D", // brand — Deep Enterprise Blue. Headings and dark surfaces, never body copy (2.1a)
  graphite: "#24282C", // brand — Graphite Charcoal. Used through its opacity ramp, not flat (2.1a)
  accent: "#1C50FF", // brand — Electric Blue. 5.107:1 on canvas, so now valid as text and as a fill (2.1b)
  hairline: "#0B2C4D14", // ink-08, light-surface border color
  hairlineOnDark: "#F4F1E81A", // canvas-10, dark-surface border color
} as const;

// Opacity ramps — the alpha steps are unchanged; only the base colour moved.
export const inkOpacity = {
  4: "#0B2C4D0A",
  6: "#0B2C4D0F", // added for the card resting fill — see .card-surface in globals.css
  8: "#0B2C4D14",
  12: "#0B2C4D1F",
  20: "#0B2C4D33",
  40: "#0B2C4D66",
  60: "#0B2C4D99",
  70: "#0B2C4DB3",
  90: "#0B2C4DE6",
} as const;

export const canvasOpacity = {
  4: "#F4F1E80A",
  10: "#F4F1E81A",
  16: "#F4F1E829",
  40: "#F4F1E866",
  60: "#F4F1E899",
  80: "#F4F1E8CC",
} as const;

export const colorDerived = {
  eyebrowOnLight: color.accent, // 5.107:1 on canvas — the old accent failed at 4.043:1 and forced
  // eyebrows onto ink-70; the brand accent clears the 4.5:1 text floor, so they are accent again (2.1c)
  eyebrowOnDark: color.canvas, // 12.549:1 on ink — confirmed by render, deliberately asymmetric (2.1c)
  // The brand accent is DARKER than the one it replaced, so it reads worse on ink, not better:
  // 2.457:1, down from 3.291:1, which now fails even the 3:1 non-text floor. An opacity ramp
  // cannot fix this — accent over ink only ever moves toward ink. So the lightened variant is
  // still required, and is re-derived from the new accent (mixed 43% toward canvas) rather than
  // carried over. Used for every accent role on a dark surface: text, borders, focus rings.
  accentOnDark: "#7995F5", // derived — 5.015:1 on ink (2.1c)
  bodyOnLight: "#24282CB3", // graphite at 70% opacity, 5.273:1 on canvas — running body/lead color (2.1a)
  bodyOnDark: canvasOpacity[80], // 8.548:1 on ink — running body/lead color on dark surfaces (2.1a)
  // The light primary button is accent-filled now that canvas text on accent clears 4.5:1
  // (5.107:1). Its hover darkens the accent 14% toward ink and holds 5.823:1.
  primaryButtonHover: "#1A4BE6", // derived — accent-filled primary button's hover fill
  primaryButtonHoverOnDark: "#E4E3DD", // derived — deepened cream, hover fill for the canvas-surface primary button on dark sections
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
  // The hero headline takes its own step rather than displayXl: in a 46%-wide column
  // displayXl broke the client's 48-character headline onto five lines. This resolves to
  // ~52px at 1440, about 23 characters a line, so it holds two. See globals.css.
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
  gutter: "clamp(1.25rem, 5vw, 5.5rem)",
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
