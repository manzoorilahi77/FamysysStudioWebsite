import { describe, expect, it } from "vitest";

import { colors } from "./colors.ts";
import {
  contrastOn,
  contrastRatio,
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

describe("parseHex", () => {
  it("reads a six-digit value into channels", () => {
    expect(parseHex(colors.darkBackground)).toEqual({ r: 11, g: 44, b: 77 });
  });

  it("expands a three-digit shorthand", () => {
    expect(parseHex("#f00")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("ignores the alpha of an eight-digit value", () => {
    expect(parseHex("#0B2C4DB3")).toEqual(parseHex(colors.darkBackground));
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
    expect(withAlpha(colors.darkBackground, 70)).toBe("#0B2C4DB3");
  });

  it("reproduces the ramp steps the site has always shipped", () => {
    expect(withAlpha(colors.darkBackground, 8)).toBe("#0B2C4D14");
    expect(withAlpha(colors.pageBackground, 80)).toBe("#F4F1E8CC");
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

  it("keeps the navy's blue lean when mixed toward white", () => {
    const tint = parseHex(mix(colors.darkBackground, colors.cardBackground, 0.87));
    expect(tint.b).toBeGreaterThan(tint.g);
    expect(tint.g).toBeGreaterThan(tint.r);
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
