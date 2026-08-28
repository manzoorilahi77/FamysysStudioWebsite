import { describe, expect, it } from "vitest";
import { InvalidSlugError } from "../errors/ValueObjectErrors";
import { Slug } from "./Slug";

describe("Slug", () => {
  it("creates a slug from a valid lowercase-hyphenated string", () => {
    const slug = Slug.create("core-platform-modernisation");

    expect(slug.value).toBe("core-platform-modernisation");
  });

  it("treats two equal slugs as equal", () => {
    const a = Slug.create("motion-graphics");
    const b = Slug.create("motion-graphics");

    expect(a.equals(b)).toBe(true);
  });

  it.each([
    ["empty string", ""],
    ["uppercase letters", "Motion-Graphics"],
    ["spaces", "motion graphics"],
    ["leading hyphen", "-motion-graphics"],
    ["trailing hyphen", "motion-graphics-"],
    ["double hyphen", "motion--graphics"],
    ["underscore", "motion_graphics"],
  ])("throws InvalidSlugError for %s", (_label, value) => {
    expect(() => Slug.create(value)).toThrow(InvalidSlugError);
  });
});
