/**
 * `valuesByColumn` is positional, aligned by index to the `AlternativeColumn[]`
 * returned by the same repository — index 0 is the value for column 0, etc.
 * A map keyed by column name was considered and rejected: it complicates static
 * content authoring for no benefit here, since columns and criteria are always
 * read together from the same repository call.
 */
export interface ComparisonCriterion {
  readonly label: string;
  readonly valuesByColumn: ReadonlyArray<string>;
}
