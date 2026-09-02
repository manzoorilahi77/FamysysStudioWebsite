// EDIT COLOURS HERE. Change a value, save, and it updates everywhere on the site.
// Every colour must be a hex value like '#1E0B2C'.
//
// This is the ONLY file in the repository allowed to contain a hex colour. Everything
// else — the opacity tints, the hover fills, the CSS variables in globals.css — is
// derived from the values below. `npm run lint` fails if a hex literal appears anywhere
// else; `npm run check-colours` prints the contrast ratio of every pairing so a change
// can be checked in seconds. See docs/changing-colours.md.
//
// ---------------------------------------------------------------------------
// PALETTE A — VOLTAGE
//
// The Studio is not the parent company and should not borrow its four colours. This is
// aubergine and electric magenta: a near-black plum ground with a blush-bone light one,
// a magenta dark enough to be TEXT on the light grounds and therefore able to carry every
// link, eyebrow and primary button, and a hot pink that is the same colour one register
// up, for the dark grounds where the magenta goes flat.
//
// Two colours beyond that, both rationed. Hot orange is secondary emphasis — status
// markers, category chips, process numerals — and sits beside the magenta rather than
// against it, both being warm. Acid lime is the opposite pole and is the one loud moment,
// capped at a single use per page. On any given screen you see plum, bone, magenta and at
// most ONE of the other two, which is what keeps four saturated colours from reading as a
// paint chart.
//
// The magenta's lightness is the whole constraint. It has to clear 4.5:1 as text on the
// deepest light ground AND carry bone text when it is a button fill, and contrast is
// symmetric, so those are the same number: 4.772:1 on the deeper sand. That is why the
// primary accent is a deep magenta rather than the coral or cyan the brief also offered —
// neither can be a word on bone. The loud ones live where they can, which is the plum.
// ---------------------------------------------------------------------------

export const colors = {
  // Backgrounds
  pageBackground: "#FCF2EA", // warm blush-bone, the ground most pages sit on
  darkBackground: "#1E0B2C", // deep aubergine, near-black with a plum cast
  cardBackground: "#FFFBF7", // warm near-white, a card lifted off the bone

  // Text
  textOnLight: "#210C2C", // the plum taken almost to black
  textOnDark: "#FCEFE6", // warm bone, one step off the page ground
  textMuted: "#3A1E42", // plum charcoal — used through its 70% step, never flat

  // Brand accents
  accentPrimary: "#B80865", // electric magenta — links, eyebrows, primary buttons
  accentOnDark: "#FF86C6", // hot pink, the same colour a register up, for the plum
  accentWarm: "#FF7038", // hot orange — status markers, chips, process numerals
  accentHighlight: "#D2FA3C", // acid lime — one moment per page, dark grounds only

  // Section grounds
  sectionAlt: "#3A1750", // lifted aubergine, for variety between dark sections
  sectionWarm: "#EFDACB", // deeper sand, for variety between light sections
} as const;

export type ColorName = keyof typeof colors;
