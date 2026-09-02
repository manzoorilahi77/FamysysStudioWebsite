// EDIT COLOURS HERE. Change a value, save, and it updates everywhere on the site.
// Every colour must be a hex value like '#191216'.
//
// This is the ONLY file in the repository allowed to contain a hex colour. Everything
// else — the opacity tints, the hover fills, the CSS variables in globals.css — is
// derived from the values below. `npm run lint` fails if a hex literal appears anywhere
// else; `npm run check-colours` prints the contrast ratio of every pairing so a change
// can be checked in seconds. See docs/changing-colours.md.
//
// ---------------------------------------------------------------------------
// PALETTE C — ULTRAVIOLET
//
// Near-black and one violent accent. The ground is a warm, aubergine-tinged black —
// dark enough that photographs and the accent both burn against it, warm enough that
// it never reads as a default #111. One colour does the talking: electric violet,
// deep on the light grounds where it has to carry text, lifted to a luminous lavender
// on the dark ones.
//
// Everything else stays out of its way. The light ground is warm bone, not white.
// Gold is the only secondary — status markers, chips, numerals — because violet and
// gold are complements that read as considered rather than loud. The one spark is
// magenta: capped at one moment per page, dark grounds only, and family with the
// violet, so it reads as the accent turned up rather than as a second voice.
//
// Same constraint as ever on the primary accent: it appears as TEXT on the light
// grounds, so it has to be dark, and contrast being symmetric that same number decides
// whether a button label reads on it.
// ---------------------------------------------------------------------------

export const colors = {
  // Backgrounds
  pageBackground: "#F5F0E6", // warm bone, the ground most pages sit on
  darkBackground: "#191216", // aubergine-tinged near-black
  cardBackground: "#FCF9F1", // warm ivory, a card lifted off the bone

  // Text
  textOnLight: "#1C1420", // the near-black taken a step toward violet
  textOnDark: "#F3EEE4", // warm bone, one step off the page ground
  textMuted: "#241E28", // violet-grey charcoal — used through its 70% step, never flat

  // Brand accents
  accentPrimary: "#6A30C9", // electric violet — links, eyebrows, primary buttons
  accentOnDark: "#B79CFF", // luminous lavender, the same violet a register up
  accentWarm: "#DFA33E", // gold — status markers, chips, process numerals
  accentHighlight: "#FF4FC3", // magenta — one moment per page, dark grounds only

  // Section grounds
  sectionAlt: "#2B2033", // violet-cast charcoal, for variety between dark sections
  sectionWarm: "#EAE3D3", // deeper bone, for variety between light sections
} as const;

export type ColorName = keyof typeof colors;
