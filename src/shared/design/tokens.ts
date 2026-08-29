// Every value here is measured off the live famysys.com compiled CSS bundle
// (or a documented, contrast-checked derivation of one). See
// docs/superpowers/specs/2026-08-28-famysys-studio-homepage-design.md §2 for
// the full sourcing and contrast-ratio rationale behind each token below.
// Mirror any change here into the matching CSS variable in src/app/globals.css.

export const color = {
  canvas: "#F7F5F2", // measured — famysys.com --color-canvas
  ink: "#0F2A4A", // measured — headings only, never body copy (see 2.1a)
  graphite: "#2C2E33", // measured — reserved for eyebrows/opacity variants, not body copy
  accent: "#1E6FFF", // measured — never a solid fill (2.1b)
  hairline: "#0F2A4A14", // measured — ink-08, light-surface border color
  hairlineOnDark: "#F7F5F21A", // measured — canvas-10, dark-surface border color
} as const;

// Opacity ramps, measured.
export const inkOpacity = {
  4: "#0F2A4A0A",
  8: "#0F2A4A14",
  12: "#0F2A4A1F",
  20: "#0F2A4A33",
  40: "#0F2A4A66",
  60: "#0F2A4A99",
  70: "#0F2A4AB3",
  90: "#0F2A4AE6",
} as const;

export const canvasOpacity = {
  10: "#F7F5F21A",
  16: "#F7F5F229",
  40: "#F7F5F266",
  60: "#F7F5F299",
  80: "#F7F5F2CC",
} as const;

export const colorDerived = {
  eyebrowOnLight: inkOpacity[70], // 5.343:1 on canvas — real `.label` color (2.1c)
  eyebrowOnDark: color.canvas, // derived — confirmed by render, deliberately asymmetric (2.1c)
  accentOnDark: "#5C96FF", // derived — accent lightened for text on ink, 5.007:1 (2.1c)
  bodyOnLight: "#2C2E33B3", // graphite at 70% opacity, 4.991:1 on canvas — real running body/lead color (2.1a)
  bodyOnDark: canvasOpacity[80], // 9.006:1 on ink — real running body/lead color on dark surfaces (2.1a)
  primaryButtonHover: "#1A65F0", // locked decision (checkpoint 5 review) — bg-ink primary button's hover fill
} as const;

export const type = {
  sans: "var(--font-jost)", // measured — famysys.com --font-jost, loaded via next/font/google
} as const;

export const typeScale = {
  displayXl: {
    size: "clamp(clamp(1.875rem, 9.4vw, 2.125rem), min(4.4vw, 9svh), 4.75rem)",
    lineHeight: 1.04,
    letterSpacing: "-0.028em",
  },
  displayL: { size: "clamp(1.75rem, 2.95vw, 3.25rem)", lineHeight: 1.08, letterSpacing: "-0.024em" },
  displayM: { size: "clamp(1.5rem, 2.25vw, 2.5rem)", lineHeight: 1.18, letterSpacing: "-0.019em" },
  displayS: { size: "clamp(1.1875rem, 1.45vw, 1.5rem)", lineHeight: 1.34, letterSpacing: "-0.013em" },
  lead: { size: "clamp(1.0625rem, 1.35vw, 1.3125rem)", lineHeight: 1.62, letterSpacing: "-0.008em" },
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

export const spacing = {
  section: "clamp(4.5rem, 10vh, 8.5rem)",
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
    base: 320,
  },
  parallax: {
    positioning: 24, // px — §4.5, scaled down from Superside's 40px per 2.7
  },
} as const;
