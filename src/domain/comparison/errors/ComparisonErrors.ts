import { DomainError } from "../../shared/errors/DomainError";

export class ComparisonAlignmentError extends DomainError {
  readonly code = "COMPARISON_ALIGNMENT";

  constructor(label: string, expected: number, received: number) {
    super(
      `Comparison criterion "${label}" has ${received} column values but ${expected} columns ` +
        `are defined — every criterion must supply exactly one value per column, in the same order.`,
    );
  }
}
