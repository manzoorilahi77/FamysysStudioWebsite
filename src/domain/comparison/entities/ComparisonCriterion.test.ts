import { describe, expect, it } from "vitest";
import { ComparisonAlignmentError } from "../errors/ComparisonErrors";
import { ComparisonCriterion, type ComparisonColumnValues } from "./ComparisonCriterion";

describe("ComparisonCriterion", () => {
  it("creates a criterion with exactly 5 aligned column values", () => {
    const criterion = ComparisonCriterion.create("Speed", [
      "Ships in days.",
      "Bottlenecked by one team's calendar.",
      "Bottlenecked by billable-hour scheduling.",
      "Fast per task, uncoordinated across tasks.",
      "Instant output, no judgment on what to build.",
    ]);

    expect(criterion.label).toBe("Speed");
    expect(criterion.valuesByColumn).toHaveLength(5);
  });

  it("throws ComparisonAlignmentError when a future, non-typechecked source supplies too few values", () => {
    // Simulates data from a source TypeScript never checked (e.g. a CMS) —
    // the tuple type alone can't catch this, only the runtime guard can.
    const misaligned = ["only", "three", "values"] as unknown as ComparisonColumnValues;

    expect(() => ComparisonCriterion.create("Speed", misaligned)).toThrow(
      ComparisonAlignmentError,
    );
  });

  it("throws ComparisonAlignmentError when a future, non-typechecked source supplies too many values", () => {
    const misaligned = ["a", "b", "c", "d", "e", "f"] as unknown as ComparisonColumnValues;

    expect(() => ComparisonCriterion.create("Speed", misaligned)).toThrow(
      ComparisonAlignmentError,
    );
  });
});
