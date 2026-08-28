import type { AlternativeColumn } from "../../domain/comparison/entities/AlternativeColumn";
import type { ComparisonCriterion } from "../../domain/comparison/entities/ComparisonCriterion";
import type { ComparisonRepository } from "../../domain/comparison/repositories/ComparisonRepository";

export interface ComparisonMatrix {
  readonly columns: ReadonlyArray<AlternativeColumn>;
  readonly criteria: ReadonlyArray<ComparisonCriterion>;
}

export class GetComparisonMatrix {
  constructor(private readonly repository: ComparisonRepository) {}

  async execute(): Promise<ComparisonMatrix> {
    const [columns, criteria] = await Promise.all([
      this.repository.getColumns(),
      this.repository.getCriteria(),
    ]);
    return { columns, criteria };
  }
}
