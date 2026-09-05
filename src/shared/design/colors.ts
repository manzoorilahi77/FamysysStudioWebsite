// EDIT COLOURS HERE. Change a value, save, and it updates everywhere on the site.
// Every colour must be a hex value like '#17191C'.
//
// THIS IS THE ONLY FILE YOU NEED. It is also the only file in the repository allowed to
// contain a hex colour — `pnpm lint` fails on a hex written anywhere else. Everything
// else is derived from the twelve values below: the opacity tints, the hover fills and
// the CSS variables in globals.css are computed in colorMath.ts and tokens.ts, and
// written out to colors.generated.css by `pnpm colours`, which `pnpm dev` and
// `pnpm build` run for you. None of those three files needs a human to open it.
//
// The plain-English guide to every colour, what it does and how to check contrast is
// docs/changing-colours.md.
//
// ===========================================================================
// HOW TO SWITCH PALETTE
//
// Every block is named `colors`. Exactly ONE may be uncommented at a time.
// Comment out the active one, uncomment the one you want, then:
//
//     pnpm check-colours
//     pnpm dev
//
// Nothing else needs editing. The last line of the file stays as it is.
// If the dev server is already running, restart it — the CSS is generated at
// startup, not on file change.
// ===========================================================================

// ---------------------------------------------------------------------------
// 1 — FAMYSYS  (the parent company's palette, for comparison)
// Deep enterprise navy, warm white, electric blue. What the site looked like
// before any of this. Kept so it can be put side by side with the rest.
// ---------------------------------------------------------------------------

// export const colors = {
//   pageBackground: "#F4F1E8",
//   darkBackground: "#0B2C4D",
//   cardBackground: "#FFFFFF",

//   textOnLight: "#0B2C4D",
//   textOnDark: "#F4F1EA",
//   textMuted: "#24282C",

//   accentPrimary: "#1C50FF",
//   accentOnDark: "#7995F5",
//   accentWarm: "#5C7A99",
//   accentHighlight: "#8FB4FF",

//   sectionAlt: "#123A63",
//   sectionWarm: "#E7E2D4",
// } as const;

// ---------------------------------------------------------------------------
// 2 — KILN  ***THIS IS THE LIVE PALETTE — the uncommented block below.***
// Deep forest-petrol grounds and warm sand, with the Claret accent pair the
// client approved on the hero. Kiln's original burnt terracotta accents were
// the part that was rejected, for reading too close to Superside's green;
// the nine grounds and neutrals survived that review unchanged. See the note
// on the accent pair inside the block, and docs/explorations/03-colour/.
// ---------------------------------------------------------------------------

export const colors = {
  pageBackground: "#F2EDE1",
  darkBackground: "#12251F",
  cardBackground: "#FCF8EE",

  textOnLight: "#16241E",
  textOnDark: "#F1EBDD",
  textMuted: "#212B25",

  // THE CLARET PAIR. The nine grounds and neutrals above are Kiln's and are unchanged;
  // these two are the approved hero design's own choice, adopted site-wide because the
  // client rejected the terracotta they replace (#A6381D / #E5906A) before settling here.
  // A deep wine carrying the primary fill, and a light rose for the roles a dark ground
  // needs a lightened accent for. See docs/explorations/01-heroes/hero-final.html, which names
  // them accentPrimary and accentOnDark for exactly these two slots.
  accentPrimary: "#7E1B33",
  accentOnDark: "#F0A8B8",
  accentWarm: "#D6A03C",
  accentHighlight: "#66E0B0",

  sectionAlt: "#1E3A31",
  sectionWarm: "#E5DCCA",
} as const;


// 3 — MIDNIGHT PLUM
// A purple site. The dark ground is a saturated aubergine-violet, and the light
// ground is pale lilac rather than white, so both halves are unmistakably tinted.
// Violet primary, hot pink secondary, butter yellow as the one loud moment.
// Bold and slightly nocturnal — reads as a studio with an opinion.
// ---------------------------------------------------------------------------

// export const colors = {
//   pageBackground: "#F1ECF8",
//   darkBackground: "#1E1030",
//   cardBackground: "#FBF8FF",
//
//   textOnLight: "#1E1030",
//   textOnDark: "#F1EAFB",
//   textMuted: "#382A4A",
//
//   accentPrimary: "#6D28D9",
//   accentOnDark: "#C4B5FD",
//   accentWarm: "#DB2777",
//   accentHighlight: "#FDE047",
//
//   sectionAlt: "#2E1A47",
//   sectionWarm: "#E4DBF1",
// } as const;

// ---------------------------------------------------------------------------
// 4 — MONO
// Pure black and white with one violent red. No third colour anywhere. The
// severest option and the one that reads most like a design studio rather than a
// service business — the work has to carry the page, which is the point.
// ---------------------------------------------------------------------------

// export const colors = {
//   pageBackground: "#FAFAFA",
//   darkBackground: "#0A0A0A",
//   cardBackground: "#FFFFFF",

//   textOnLight: "#0A0A0A",
//   textOnDark: "#FAFAFA",
//   textMuted: "#2E2E2E",

//   accentPrimary: "#C1121F",
//   accentOnDark: "#FF6B6B",
//   accentWarm: "#8A8A8A",
//   accentHighlight: "#FF3B30",

//   sectionAlt: "#1C1C1C",
//   sectionWarm: "#EBEBEB",
// } as const;

// ---------------------------------------------------------------------------
// 5 — ESPRESSO
// A brown site. Dark chocolate ground, warm cream light ground, deep burgundy
// primary and antique gold secondary, with a cold sky-blue spark cutting through
// all the warmth. Expensive and slightly old-world — a print house.
// ---------------------------------------------------------------------------

// export const colors = {
//   pageBackground: "#F3EBE1",
//   darkBackground: "#241A15",
//   cardBackground: "#FDF8F2",
//
//   textOnLight: "#241A15",
//   textOnDark: "#F3E9DD",
//   textMuted: "#3B2C24",
//
//   accentPrimary: "#8B1E3F",
//   accentOnDark: "#E9A7B8",
//   accentWarm: "#B08D57",
//   accentHighlight: "#7DD3FC",
//
//   sectionAlt: "#35271F",
//   sectionWarm: "#E6DACB",
// } as const;

// ---------------------------------------------------------------------------
// 6 — INDIGO ELECTRIC
// A blue site, but violet-blue rather than corporate navy. The dark ground is
// deep indigo, the light ground pale periwinkle, and an acid lime cuts across
// both. High energy — the loudest palette here.
// ---------------------------------------------------------------------------

// export const colors = {
//   pageBackground: "#EDEEFA",
//   darkBackground: "#191B4D",
//   cardBackground: "#F9FAFF",
//
//   textOnLight: "#191B4D",
//   textOnDark: "#EDEEFA",
//   textMuted: "#2B2E5E",
//
//   accentPrimary: "#3D2FA8",
//   accentOnDark: "#A5B4FC",
//   accentWarm: "#8B90C7",
//   accentHighlight: "#D9F94F",
//
//   sectionAlt: "#252873",
//   sectionWarm: "#DFE1F4",
// } as const;

// ---------------------------------------------------------------------------
// 7 — ROSE ATELIER
// Light-dominant and unusually soft. The page ground is a pale blush, the dark
// sections are deep maroon rather than black, and a dusty slate blue does the
// secondary work. Gallery-like — the gentlest palette here, and the one that
// leans most on the photography.
// ---------------------------------------------------------------------------

// export const colors = {
//   pageBackground: "#FBEFF1",
//   darkBackground: "#3B0A1E",
//   cardBackground: "#FFF9FA",
//
//   textOnLight: "#3B0A1E",
//   textOnDark: "#FAEBEE",
//   textMuted: "#4E2231",
//
//   accentPrimary: "#8C2749",
//   accentOnDark: "#F4A8BE",
//   accentWarm: "#7A8CA3",
//   accentHighlight: "#FFC9DB",
//
//   sectionAlt: "#4E1229",
//   sectionWarm: "#F2E1E5",
// } as const;

// ---------------------------------------------------------------------------
// 8 — STEEL
// A cool grey-blue site. Neither black nor navy — the grounds are slate, the
// light side is a cold paper grey, and a warm amber is the only heat anywhere.
// The most restrained and the most obviously professional.
// ---------------------------------------------------------------------------

// export const colors = {
//   pageBackground: "#E8ECEF",
//   darkBackground: "#1C2126",
//   cardBackground: "#F7F9FB",
//
//   textOnLight: "#1C2126",
//   textOnDark: "#E9EDF1",
//   textMuted: "#2C343B",
//
//   accentPrimary: "#1B5E7A",
//   accentOnDark: "#8ED3EC",
//   accentWarm: "#9BA7B2",
//   accentHighlight: "#FFB020",
//
//   sectionAlt: "#2A3138",
//   sectionWarm: "#D9DFE5",
// } as const;

// ---------------------------------------------------------------------------
// 9 — NOIR & CYAN
// Near-black with an electric cyan. The dark ground is true black with a blue
// cast, the light ground almost white, and the cyan appears only on dark — which
// is where it can be loud without becoming unreadable. Technical and modern.
// ---------------------------------------------------------------------------

// export const colors = {
//   pageBackground: "#F2F4F5",
//   darkBackground: "#0D1114",
//   cardBackground: "#FFFFFF",
//
//   textOnLight: "#0D1114",
//   textOnDark: "#F0F4F6",
//   textMuted: "#232B30",
//
//   accentPrimary: "#00596B",
//   accentOnDark: "#5EE9F0",
//   accentWarm: "#8A9AA1",
//   accentHighlight: "#22D3EE",
//
//   sectionAlt: "#161C21",
//   sectionWarm: "#E2E7EA",
// } as const;

// ---------------------------------------------------------------------------
// 10 — SAND & OXBLOOD
// Warm, earthy and light-dominant without being beige. Sand page ground, a very
// dark brown-black for the rare dark sections, oxblood carrying the primary work
// and a deep teal as the cool counterweight.
// ---------------------------------------------------------------------------

// export const colors = {
//   pageBackground: "#EFE7D9",
//   darkBackground: "#1F1A14",
//   cardBackground: "#FAF5EC",
//
//   textOnLight: "#1F1A14",
//   textOnDark: "#EFE6D6",
//   textMuted: "#332B21",
//
//   accentPrimary: "#7F1D1D",
//   accentOnDark: "#E8A0A0",
//   accentWarm: "#0F766E",
//   accentHighlight: "#FCD34D",
//
//   sectionAlt: "#2E271E",
//   sectionWarm: "#E2D8C6",
// } as const;

export type ColorName = keyof typeof colors;