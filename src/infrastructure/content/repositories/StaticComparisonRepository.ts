import type { AlternativeColumn } from "../../../domain/comparison/entities/AlternativeColumn";
import type { ComparisonCriterion } from "../../../domain/comparison/entities/ComparisonCriterion";
import type { ComparisonRepository } from "../../../domain/comparison/repositories/ComparisonRepository";
import { comparisonColumns, comparisonCriteria } from "../static/comparison.content";

export class StaticComparisonRepository implements ComparisonRepository {
  async getColumns(): Promise<ReadonlyArray<AlternativeColumn>> {
    return comparisonColumns;
  }

  async getCriteria(): Promise<ReadonlyArray<ComparisonCriterion>> {
    return comparisonCriteria;
  }
}
