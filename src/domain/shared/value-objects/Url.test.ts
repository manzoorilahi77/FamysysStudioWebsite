import { describe, expect, it } from "vitest";
import { InvalidUrlError } from "../errors/ValueObjectErrors";
import { Url } from "./Url";

describe("Url", () => {
  it("creates a Url from an absolute https URL", () => {
    const url = Url.create("https://famysys.com/studio");

    expect(url.value).toBe("https://famysys.com/studio");
    expect(url.isExternal).toBe(true);
  });

  it("creates a Url from a root-relative path", () => {
    const url = Url.create("/contact");

    expect(url.value).toBe("/contact");
    expect(url.isExternal).toBe(false);
  });

  it("trims surrounding whitespace", () => {
    const url = Url.create("  /contact  ");

    expect(url.value).toBe("/contact");
  });

  it("treats two equal URLs as equal", () => {
    const a = Url.create("/contact");
    const b = Url.create("/contact");

    expect(a.equals(b)).toBe(true);
  });

  it.each([
    ["empty string", ""],
    ["whitespace only", "   "],
    ["relative path without leading slash", "contact"],
    ["bare word", "not-a-url"],
  ])("throws InvalidUrlError for %s", (_label, value) => {
    expect(() => Url.create(value)).toThrow(InvalidUrlError);
  });
});
