import { describe, expect, it } from "vitest";
import { InvalidFullNameError } from "../errors/LeadErrors";
import { FullName } from "./FullName";

describe("FullName", () => {
  it("creates a FullName from a valid first and last name", () => {
    const name = FullName.create("  Jane   Doe  ");

    expect(name.value).toBe("Jane Doe");
  });

  /**
   * A single word is a NAME, not a mistake. The rule used to be "a first and last name are
   * both required", which rejected mononyms outright and anyone typing the name they go
   * by. The field is optional now and nothing is gained by arguing with the answer.
   */
  it.each(["Prince", "Cher", "  Madonna  "])("accepts the single-word name %p", (value) => {
    expect(FullName.create(value).value).toBe(value.trim());
  });

  it.each([
    ["empty string", ""],
    ["whitespace only", "   "],
    ["over 100 characters", `${"a".repeat(50)} ${"b".repeat(51)}`],
  ])("throws InvalidFullNameError for %s", (_label, value) => {
    expect(() => FullName.create(value)).toThrow(InvalidFullNameError);
  });
});
