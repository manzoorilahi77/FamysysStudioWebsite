import type { AlternativeColumn } from "../../../domain/comparison/entities/AlternativeColumn";
import type { ComparisonCriterion } from "../../../domain/comparison/entities/ComparisonCriterion";
import type { ComparisonRepository } from "../../../domain/comparison/repositories/ComparisonRepository";

export class FakeComparisonRepository implements ComparisonRepository {
  columnsCalls = 0;
  criteriaCalls = 0;
  error: Error | undefined;

  constructor(
    private readonly columns: ReadonlyArray<AlternativeColumn>,
    private readonly criteria: ReadonlyArray<ComparisonCriterion>,
  ) {}

  async getColumns(): Promise<ReadonlyArray<AlternativeColumn>> {
    this.columnsCalls += 1;
    if (this.error) {
      throw this.error;
    }
    return this.columns;
  }

  async getCriteria(): Promise<ReadonlyArray<ComparisonCriterion>> {
    this.criteriaCalls += 1;
    if (this.error) {
      throw this.error;
    }
    return this.criteria;
  }
}
