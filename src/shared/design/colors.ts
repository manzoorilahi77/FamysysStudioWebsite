// EDIT COLOURS HERE. Change a value, save, and it updates everywhere on the site.
// Every colour must be a hex value like '#0B2C4D'.
//
// This is the ONLY file in the repository allowed to contain a hex colour. Everything
// else — the opacity tints, the hover fills, the CSS variables in globals.css — is
// derived from the values below. `npm run lint` fails if a hex literal appears anywhere
// else; `npm run check-colours` prints the contrast ratio of every pairing so a change
// can be checked in seconds. See docs/changing-colours.md.

export const colors = {
  // Backgrounds
  pageBackground: "#F4F1E8", // the warm cream most pages sit on
  darkBackground: "#0B2C4D", // deep navy sections
  cardBackground: "#FFFFFF", // raised cards

  // Text
  textOnLight: "#0B2C4D",
  textOnDark: "#F4F1EA",
  textMuted: "#24282C",

  // Brand accents
  accentPrimary: "#1C50FF", // main brand blue — buttons, links
  accentOnDark: "#7995F5", // lighter blue, for use on navy
  accentWarm: "#FF6B4A", // warm accent
  accentHighlight: "#C9F24D", // bright highlight

  // Section grounds
  sectionAlt: "#1A3A5C", // lighter navy, for variety between dark sections
  sectionWarm: "#EDE6D8", // deeper cream, for variety between light sections
} as const;

export type ColorName = keyof typeof colors;
