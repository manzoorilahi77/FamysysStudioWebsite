import { describe, expect, it } from "vitest";
import { InvalidProjectBriefError } from "../errors/LeadErrors";
import { ProjectBrief } from "./ProjectBrief";

describe("ProjectBrief", () => {
  it("keeps the sender's text, trimmed", () => {
    expect(ProjectBrief.create("  A launch film for a new product.  ").value).toBe(
      "A launch film for a new product.",
    );
  });

  it("accepts a very short brief rather than teaching the sender to pad it", () => {
    expect(ProjectBrief.create("AV").value).toBe("AV");
  });

  it.each(["", "   ", "a"])("throws InvalidProjectBriefError for the empty brief %s", (value) => {
    expect(() => ProjectBrief.create(value)).toThrow(InvalidProjectBriefError);
  });

  it("throws InvalidProjectBriefError past the length ceiling", () => {
    expect(() => ProjectBrief.create("x".repeat(4001))).toThrow(InvalidProjectBriefError);
  });
});
