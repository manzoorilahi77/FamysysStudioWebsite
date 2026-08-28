import { ComparisonAlignmentError } from "../errors/ComparisonErrors";

/**
 * The comparison matrix is fixed at exactly 5 columns (Famysys Studio vs. In-house
 * team, Traditional agency, Freelancers, AI tools alone), so `valuesByColumn` is a
 * tuple, not an open-ended array — a content file with the wrong number of values
 * fails to compile, not just fails silently at render time.
 *
 * `valuesByColumn` is still positional, aligned by index to the `AlternativeColumn[]`
 * returned by the same repository — index 0 is the value for column 0, etc. A map
 * keyed by column name was considered and rejected: it complicates static content
 * authoring for no benefit here, since columns and criteria are always read together
 * from the same repository call. The tuple type catches a wrong-length literal at
 * compile time; `create()` below also guards at runtime, since a future non-static
 * repository (e.g. a CMS) can supply data TypeScript never checked.
 */
export const COMPARISON_COLUMN_COUNT = 5;

export type ComparisonColumnValues = readonly [string, string, string, string, string];

export class ComparisonCriterion {
  private constructor(
    readonly label: string,
    readonly valuesByColumn: ComparisonColumnValues,
  ) {}

  static create(label: string, valuesByColumn: ComparisonColumnValues): ComparisonCriterion {
    if (valuesByColumn.length !== COMPARISON_COLUMN_COUNT) {
      throw new ComparisonAlignmentError(label, COMPARISON_COLUMN_COUNT, valuesByColumn.length);
    }
    return new ComparisonCriterion(label, valuesByColumn);
  }
}
