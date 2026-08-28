import { describe, expect, it } from "vitest";
import type { AlternativeColumn } from "../../domain/comparison/entities/AlternativeColumn";
import { ComparisonCriterion } from "../../domain/comparison/entities/ComparisonCriterion";
import { FakeComparisonRepository } from "./__fakes__/FakeComparisonRepository";
import { GetComparisonMatrix } from "./GetComparisonMatrix";

function fixtureColumns(): ReadonlyArray<AlternativeColumn> {
  return [
    { name: "Famysys Studio", isHighlighted: true },
    { name: "In-house team", isHighlighted: false },
    { name: "Traditional agency", isHighlighted: false },
    { name: "Freelancers", isHighlighted: false },
    { name: "AI tools alone", isHighlighted: false },
  ];
}

function fixtureCriteria() {
  return [
    ComparisonCriterion.create("Speed", [
      "Ships in days.",
      "Bottlenecked by one team's calendar.",
      "Bottlenecked by billable-hour scheduling.",
      "Fast per task, uncoordinated across tasks.",
      "Instant output, no judgment on what to build.",
    ]),
  ];
}

describe("GetComparisonMatrix", () => {
  it("composes columns and criteria from the repository", async () => {
    const columns = fixtureColumns();
    const criteria = fixtureCriteria();
    const repository = new FakeComparisonRepository(columns, criteria);
    const useCase = new GetComparisonMatrix(repository);

    const result = await useCase.execute();

    expect(result.columns).toBe(columns);
    expect(result.criteria).toBe(criteria);
    expect(repository.columnsCalls).toBe(1);
    expect(repository.criteriaCalls).toBe(1);
  });

  it("propagates a repository failure", async () => {
    const repository = new FakeComparisonRepository(fixtureColumns(), fixtureCriteria());
    repository.error = new Error("comparison source unavailable");
    const useCase = new GetComparisonMatrix(repository);

    await expect(useCase.execute()).rejects.toThrow("comparison source unavailable");
  });
});
