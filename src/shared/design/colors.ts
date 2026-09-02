// EDIT COLOURS HERE. Change a value, save, and it updates everywhere on the site.
// Every colour must be a hex value like '#12251F'.
//
// This is the ONLY file in the repository allowed to contain a hex colour. Everything
// else — the opacity tints, the hover fills, the CSS variables in globals.css — is
// derived from the values below. `npm run lint` fails if a hex literal appears anywhere
// else; `npm run check-colours` prints the contrast ratio of every pairing so a change
// can be checked in seconds. See docs/changing-colours.md.
//
// ---------------------------------------------------------------------------
// PALETTE B — KILN
//
// The restrained half of the pair. Deep forest-petrol and burnt terracotta on warm sand:
// a fired-clay palette, the colours of a workshop rather than of a screen. Nothing here
// is neon, and nothing here is navy.
//
// The ground is a very dark blue-green — green enough to be unmistakably not navy, dark
// enough to sit under a photograph without competing with it. The light ground is sand
// rather than white or bone, which is what stops the terracotta looking like a warning.
//
// The accents are one family plus one spark. Terracotta carries every primary role on
// light grounds; apricot is that same clay lightened for the dark ones. Aged brass is
// secondary emphasis and sits between them. Jade is the single loud moment: cool against
// three warm colours and family with the forest ground, so it reads as a highlight rather
// than as an intrusion — and it is capped at one use per page, on dark grounds only.
//
// Same constraint as ever on the primary accent: it appears as TEXT on the light grounds,
// so it has to be dark, and contrast being symmetric that same number decides whether a
// button label reads on it. The terracotta clears 4.664:1 on the deeper sand.
// ---------------------------------------------------------------------------

export const colors = {
  // Backgrounds
  pageBackground: "#F2EDE1", // warm sand, the ground most pages sit on
  darkBackground: "#12251F", // deep forest-petrol, dark enough to sit under a photograph
  cardBackground: "#FCF8EE", // warm ivory, a card lifted off the sand

  // Text
  textOnLight: "#16241E", // the forest taken almost to black
  textOnDark: "#F1EBDD", // warm sand, one step off the page ground
  textMuted: "#212B25", // moss charcoal — used through its 70% step, never flat

  // Brand accents
  accentPrimary: "#A6381D", // burnt terracotta — links, eyebrows, primary buttons
  accentOnDark: "#E5906A", // apricot, the same clay a register up, for the forest
  accentWarm: "#D6A03C", // aged brass — status markers, chips, process numerals
  accentHighlight: "#66E0B0", // jade — one moment per page, dark grounds only

  // Section grounds
  sectionAlt: "#1E3A31", // lifted forest, for variety between dark sections
  sectionWarm: "#E5DCCA", // deeper sand, for variety between light sections
} as const;

export type ColorName = keyof typeof colors;
