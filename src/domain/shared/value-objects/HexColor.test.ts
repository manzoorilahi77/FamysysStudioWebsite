import { describe, expect, it } from "vitest";
import { InvalidHexColorError } from "../errors/ValueObjectErrors";
import { HexColor } from "./HexColor";

describe("HexColor", () => {
  it("creates a HexColor from a 6-digit hex value and uppercases it", () => {
    const color = HexColor.create("#1c50ff");

    expect(color.value).toBe("#1C50FF");
  });

  it("accepts 3-digit and 8-digit hex values", () => {
    expect(HexColor.create("#fff").value).toBe("#FFF");
    expect(HexColor.create("#0b2c4d14").value).toBe("#0B2C4D14");
  });

  it("treats two equal colors as equal", () => {
    const a = HexColor.create("#1C50FF");
    const b = HexColor.create("#1c50ff");

    expect(a.equals(b)).toBe(true);
  });

  it.each([
    ["missing hash", "1C50FF"],
    ["wrong length", "#1C50"],
    ["non-hex characters", "#GGGGGG"],
    ["empty string", ""],
  ])("throws InvalidHexColorError for %s", (_label, value) => {
    expect(() => HexColor.create(value)).toThrow(InvalidHexColorError);
  });
});
