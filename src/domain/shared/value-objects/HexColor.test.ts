import { describe, expect, it } from "vitest";
import { InvalidHexColorError } from "../errors/ValueObjectErrors";
import { HexColor } from "./HexColor";

describe("HexColor", () => {
  it("creates a HexColor from a 6-digit hex value and uppercases it", () => {
    const color = HexColor.create("#1e6fff");

    expect(color.value).toBe("#1E6FFF");
  });

  it("accepts 3-digit and 8-digit hex values", () => {
    expect(HexColor.create("#fff").value).toBe("#FFF");
    expect(HexColor.create("#0f2a4a14").value).toBe("#0F2A4A14");
  });

  it("treats two equal colors as equal", () => {
    const a = HexColor.create("#1E6FFF");
    const b = HexColor.create("#1e6fff");

    expect(a.equals(b)).toBe(true);
  });

  it.each([
    ["missing hash", "1E6FFF"],
    ["wrong length", "#1E6F"],
    ["non-hex characters", "#GGGGGG"],
    ["empty string", ""],
  ])("throws InvalidHexColorError for %s", (_label, value) => {
    expect(() => HexColor.create(value)).toThrow(InvalidHexColorError);
  });
});
