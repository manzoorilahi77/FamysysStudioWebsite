import { describe, expect, it } from "vitest";

import { colors } from "./colors.ts";
import {
  contrastOn,
  contrastRatio,
  darken,
  flatten,
  mix,
  parseHex,
  relativeLuminance,
  toHex,
  withAlpha,
} from "./colorMath.ts";

const BLACK = "#000000";
const WHITE = "#FFFFFF";
const MID = "#808080";
/**
 * A fixture, not a palette value. These tests are about the arithmetic, so they use fixed
 * inputs with known answers — reading them out of colors.ts would make the suite fail
 * every time the site is recoloured, which is the opposite of what it is for.
 */
const SAMPLE = "#0B2C4D";

describe("parseHex", () => {
  it("reads a six-digit value into channels", () => {
    expect(parseHex(SAMPLE)).toEqual({ r: 11, g: 44, b: 77 });
  });

  it("expands a three-digit shorthand", () => {
    expect(parseHex("#f00")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("ignores the alpha of an eight-digit value", () => {
    expect(parseHex("#0B2C4DB3")).toEqual(parseHex(SAMPLE));
  });
});

describe("toHex", () => {
  it("rounds and pads each channel, uppercased", () => {
    expect(toHex({ r: 11.4, g: 44.5, b: 77 })).toBe("#0B2D4D");
  });

  it("clamps out-of-range channels rather than wrapping", () => {
    expect(toHex({ r: -20, g: 300, b: 128 })).toBe("#00FF80");
  });
});

describe("withAlpha", () => {
  it("appends the alpha step and leaves the channels alone", () => {
    expect(withAlpha(SAMPLE, 70)).toBe("#0B2C4DB3");
  });

  it("maps each ramp step onto the right alpha byte", () => {
    expect(withAlpha(SAMPLE, 8)).toBe("#0B2C4D14");
    expect(withAlpha(SAMPLE, 100)).toBe("#0B2C4DFF");
    expect(withAlpha(SAMPLE, 0)).toBe("#0B2C4D00");
  });

  it("keeps the ramp in step with whatever base it is given", () => {
    expect(withAlpha(colors.darkBackground, 70).slice(0, 7)).toBe(colors.darkBackground);
  });
});

describe("mix", () => {
  it("returns the start colour at 0 and the end colour at 1", () => {
    expect(mix(BLACK, WHITE, 0)).toBe(BLACK);
    expect(mix(BLACK, WHITE, 1)).toBe(WHITE);
  });

  it("meets in the middle at 0.5", () => {
    expect(mix(BLACK, WHITE, 0.5)).toBe(MID);
  });

  it("preserves the order of the channels when mixed toward pure white", () => {
    const base = parseHex(colors.darkBackground);
    const tint = parseHex(mix(colors.darkBackground, WHITE, 0.87));
    const order = (c: { r: number; g: number; b: number }) =>
      [c.r, c.g, c.b]
        .map((value, index) => [value, index] as const)
        .sort((a, b) => a[0] - b[0])
        .map(([, index]) => index);
    expect(order(tint)).toEqual(order(base));
  });

  it("lands every channel between the two endpoints", () => {
    const from = parseHex(colors.darkBackground);
    const to = parseHex(colors.cardBackground);
    const blend = parseHex(mix(colors.darkBackground, colors.cardBackground, 0.4));
    for (const channel of ["r", "g", "b"] as const) {
      expect(blend[channel]).toBeGreaterThanOrEqual(Math.min(from[channel], to[channel]));
      expect(blend[channel]).toBeLessThanOrEqual(Math.max(from[channel], to[channel]));
    }
  });
});

describe("darken", () => {
  it("returns the colour unchanged at 0 and black at 1", () => {
    expect(darken(colors.darkBackground, 0)).toBe(colors.darkBackground.toUpperCase());
    expect(darken(colors.accentWarm, 1)).toBe(BLACK);
  });

  it("lowers every channel and therefore the luminance", () => {
    const darker = darken(colors.darkBackground, 0.4);
    expect(relativeLuminance(darker)).toBeLessThan(relativeLuminance(colors.darkBackground));
  });
});

describe("flatten", () => {
  it("composites an alpha colour over its ground", () => {
    expect(flatten("#00000080", WHITE)).toBe(mix(WHITE, BLACK, 128 / 255));
  });

  it("returns an opaque colour unchanged", () => {
    expect(flatten(colors.accentPrimary, colors.pageBackground)).toBe(colors.accentPrimary);
  });
});

describe("relativeLuminance", () => {
  it("puts black at 0 and white at 1", () => {
    expect(relativeLuminance(BLACK)).toBeCloseTo(0, 6);
    expect(relativeLuminance(WHITE)).toBeCloseTo(1, 6);
  });
});

describe("contrastRatio", () => {
  it("gives 21:1 for black on white", () => {
    expect(contrastRatio(BLACK, WHITE)).toBeCloseTo(21, 3);
  });

  it("gives 1:1 for a colour against itself", () => {
    expect(contrastRatio(colors.accentWarm, colors.accentWarm)).toBeCloseTo(1, 6);
  });

  it("is symmetric — order of the pair does not change the ratio", () => {
    const forwards = contrastRatio(colors.accentPrimary, colors.pageBackground);
    const backwards = contrastRatio(colors.pageBackground, colors.accentPrimary);
    expect(forwards).toBeCloseTo(backwards, 9);
  });
});

describe("contrastOn", () => {
  it("measures a transparent foreground against what it actually composites to", () => {
    const body = withAlpha(colors.textMuted, 70);
    expect(contrastOn(body, colors.pageBackground)).toBeCloseTo(
      contrastRatio(flatten(body, colors.pageBackground), colors.pageBackground),
      9,
    );
  });

  it("reports body copy on the cream over the 4.5:1 text floor", () => {
    expect(contrastOn(withAlpha(colors.textMuted, 70), colors.pageBackground)).toBeGreaterThan(4.5);
  });

  it("reports the bright highlight on the cream as unusable for text", () => {
    expect(contrastOn(colors.accentHighlight, colors.pageBackground)).toBeLessThan(3);
  });
});
