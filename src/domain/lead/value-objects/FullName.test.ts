import { describe, expect, it } from "vitest";
import { InvalidFullNameError } from "../errors/LeadErrors";
import { FullName } from "./FullName";

describe("FullName", () => {
  it("creates a FullName from a valid first and last name", () => {
    const name = FullName.create("  Jane   Doe  ");

    expect(name.value).toBe("Jane Doe");
  });

  it.each([
    ["empty string", ""],
    ["whitespace only", "   "],
    ["single word", "Jane"],
    ["over 100 characters", `${"a".repeat(50)} ${"b".repeat(51)}`],
  ])("throws InvalidFullNameError for %s", (_label, value) => {
    expect(() => FullName.create(value)).toThrow(InvalidFullNameError);
  });
});
