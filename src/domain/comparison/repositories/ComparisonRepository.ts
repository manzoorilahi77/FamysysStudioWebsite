import type { AlternativeColumn } from "../entities/AlternativeColumn";
import type { ComparisonCriterion } from "../entities/ComparisonCriterion";

export interface ComparisonRepository {
  getColumns(): Promise<ReadonlyArray<AlternativeColumn>>;
  getCriteria(): Promise<ReadonlyArray<ComparisonCriterion>>;
}
