// EDIT COLOURS HERE. Change a value, save, and it updates everywhere on the site.
// Every colour must be a hex value like '#17191C'.
//
// This is the ONLY file in the repository allowed to contain a hex colour. Everything
// else — the opacity tints, the hover fills, the CSS variables in globals.css — is
// derived from the values below. `npm run lint` fails if a hex literal appears anywhere
// else; `npm run check-colours` prints the contrast ratio of every pairing so a change
// can be checked in seconds. See docs/changing-colours.md.
//
// ---------------------------------------------------------------------------
// PALETTE D — GLACIER
//
// Charcoal with a cool spark. The ground is a neutral graphite — no green, no navy,
// no warmth — and the whole palette runs cold: ice blue as the voice on the dark
// grounds, a deep steel blue carrying text and buttons on the light ones, silver for
// the secondary roles where the other palettes reached for gold or brass.
//
// The light ground is a blue-grey paper rather than white, so the light sections read
// as the same cold air as the dark ones rather than as a different site. The one spark
// is periwinkle — an electric blue-violet, family with the ice blue but unmistakably a
// step outside it — capped at one moment per page, dark grounds only.
//
// This is the restrained option: two blues and a silver, everything else neutral.
// Saturation is rationed to the accents; the grounds carry none.
//
// Same constraint as ever on the primary accent: it appears as TEXT on the light
// grounds, so it has to be dark, and contrast being symmetric that same number decides
// whether a button label reads on it.
// ---------------------------------------------------------------------------

export const colors = {
  // Backgrounds
  pageBackground: "#ECEFF3", // blue-grey paper, the ground most pages sit on
  darkBackground: "#17191C", // neutral graphite
  cardBackground: "#F8FAFC", // cold ivory, a card lifted off the paper

  // Text
  textOnLight: "#14181D", // graphite taken almost to black
  textOnDark: "#EDF1F5", // ice white, one step off the page ground
  textMuted: "#1E242B", // slate charcoal — used through its 70% step, never flat

  // Brand accents
  accentPrimary: "#1F4E8C", // deep steel blue — links, eyebrows, primary buttons
  accentOnDark: "#8FD0F2", // ice blue, the cold voice on the dark grounds
  accentWarm: "#B9C2CC", // silver — status markers, chips, process numerals
  accentHighlight: "#7B8CFF", // electric periwinkle — one moment per page, dark grounds only

  // Section grounds
  sectionAlt: "#24272C", // lifted graphite, for variety between dark sections
  sectionWarm: "#DEE3E9", // deeper steel paper, for variety between light sections
} as const;

export type ColorName = keyof typeof colors;
