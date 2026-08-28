import { describe, expect, it } from "vitest";
import { StaticComparisonRepository } from "./StaticComparisonRepository";

describe("StaticComparisonRepository", () => {
  it("returns exactly 5 columns with Famysys Studio highlighted", async () => {
    const repository = new StaticComparisonRepository();

    const columns = await repository.getColumns();

    expect(columns).toHaveLength(5);
    expect(columns.filter((column) => column.isHighlighted)).toHaveLength(1);
    expect(columns[0]?.name).toBe("Famysys Studio");
  });

  it("returns exactly 6 criteria, each aligned to all 5 columns", async () => {
    const repository = new StaticComparisonRepository();

    const criteria = await repository.getCriteria();

    expect(criteria).toHaveLength(6);
    expect(criteria.every((criterion) => criterion.valuesByColumn.length === 5)).toBe(true);
  });
});
