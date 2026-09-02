// Colour arithmetic. Every derived value in tokens.ts is produced by one of these
// functions applied to a base in colors.ts, which is what makes a single edit there
// reach the whole site.
//
// No hex literal appears in this file: these functions parse and build hex strings
// from numbers, they never name a colour. That is deliberate — colors.ts is the only
// file allowed to name one.

interface Rgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

const HEX_RADIX = 16;
const CHANNEL_MAX = 255;
const HEX_PREFIX = "#";
const SHORT_HEX_LENGTH = 3;
const PERCENT_MAX = 100;

/** WCAG 2.x sRGB linearisation constants — see w3.org/WAI/GL/wiki/Relative_luminance. */
const SRGB_THRESHOLD = 0.04045;
const SRGB_LINEAR_DIVISOR = 12.92;
const SRGB_GAMMA_OFFSET = 0.055;
const SRGB_GAMMA_DIVISOR = 1.055;
const SRGB_GAMMA_EXPONENT = 2.4;
const LUMINANCE_R = 0.2126;
const LUMINANCE_G = 0.7152;
const LUMINANCE_B = 0.0722;
const CONTRAST_OFFSET = 0.05;

const pair = (hex: string, index: number): number =>
  Number.parseInt(hex.slice(index, index + 2), HEX_RADIX);

/**
 * Accepts `#RGB`, `#RRGGBB` and `#RRGGBBAA`. The alpha of an 8-digit value is dropped:
 * every consumer that needs to measure an alpha colour composites it first with
 * `flatten`, because a contrast ratio is only meaningful between opaque colours.
 */
export function parseHex(hex: string): Rgb {
  const body = hex.startsWith(HEX_PREFIX) ? hex.slice(1) : hex;
  const expanded =
    body.length === SHORT_HEX_LENGTH
      ? body
          .split("")
          .map((character) => character + character)
          .join("")
      : body;
  return { r: pair(expanded, 0), g: pair(expanded, 2), b: pair(expanded, 4) };
}

const channelToHex = (value: number): string =>
  Math.round(Math.min(CHANNEL_MAX, Math.max(0, value)))
    .toString(HEX_RADIX)
    .padStart(2, "0");

export const toHex = ({ r, g, b }: Rgb): string =>
  (HEX_PREFIX + channelToHex(r) + channelToHex(g) + channelToHex(b)).toUpperCase();

/**
 * `base` at `percent` opacity, as an 8-digit hex. The site's opacity ramps
 * (`ink-40`, `canvas-80`, …) are all this function.
 */
export function withAlpha(base: string, percent: number): string {
  const { r, g, b } = parseHex(base);
  const alpha = channelToHex((percent / PERCENT_MAX) * CHANNEL_MAX);
  return (HEX_PREFIX + channelToHex(r) + channelToHex(g) + channelToHex(b) + alpha).toUpperCase();
}

/** `from` moved `amount` (0–1) of the way toward `to`. */
export function mix(from: string, to: string, amount: number): string {
  const a = parseHex(from);
  const b = parseHex(to);
  const blend = (start: number, end: number): number => start + (end - start) * amount;
  return toHex({ r: blend(a.r, b.r), g: blend(a.g, b.g), b: blend(a.b, b.b) });
}

/**
 * An alpha colour composited over an opaque ground, so it can be measured. Contrast is a
 * property of what the eye actually receives, and `ink-70` on cream is not `ink`.
 */
export function flatten(foreground: string, background: string): string {
  const body = foreground.startsWith(HEX_PREFIX) ? foreground.slice(1) : foreground;
  const alpha = body.length === 8 ? pair(body, 6) / CHANNEL_MAX : 1;
  return mix(background, foreground, alpha);
}

const linearise = (channel: number): number => {
  const value = channel / CHANNEL_MAX;
  return value <= SRGB_THRESHOLD
    ? value / SRGB_LINEAR_DIVISOR
    : Math.pow((value + SRGB_GAMMA_OFFSET) / SRGB_GAMMA_DIVISOR, SRGB_GAMMA_EXPONENT);
};

export function relativeLuminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  return LUMINANCE_R * linearise(r) + LUMINANCE_G * linearise(g) + LUMINANCE_B * linearise(b);
}

/**
 * WCAG contrast ratio, 1–21. Both arguments must be opaque; pass an alpha colour
 * through `flatten` against its real ground first.
 */
export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + CONTRAST_OFFSET) / (darker + CONTRAST_OFFSET);
}

/** Contrast of a possibly-transparent foreground against the ground it sits on. */
export const contrastOn = (foreground: string, background: string): number =>
  contrastRatio(flatten(foreground, background), background);
