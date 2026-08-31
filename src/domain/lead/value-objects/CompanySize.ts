import { InvalidCompanySizeError } from "../errors/LeadErrors";

/**
 * The four bands famysys.com's own contact form uses, adopted rather than invented so a
 * lead arriving through the Studio's form is bucketed the same way as one arriving
 * through the parent's.
 *
 * These REPLACED a five-band set (1-10 / 11-50 / 51-200 / 201-500 / 500+) when /contact
 * was built, rather than being added alongside it. Both forms read `options()`, so the
 * homepage's closing form now offers these too. Keeping two overlapping vocabularies —
 * where "1–50" and "1–50" are each valid — would have made the answers un-comparable
 * across the two forms for the sake of a set neither the client nor the brief had ever
 * confirmed. Nothing persists a submitted band yet (see StubLeadRepository), so there is
 * no stored data to migrate. Listed in docs/content-todo.md for confirmation.
 *
 * The band string is both the submitted value and the rendered label, so the en dashes
 * and the thousands comma are deliberate: they are what the option reads as on the page.
 */
const BANDS = ["1–50", "50–200", "200–1,000", "1,000+"] as const;

export type CompanySizeBand = (typeof BANDS)[number];

export class CompanySize {
  private constructor(readonly band: CompanySizeBand) {}

  static create(value: string): CompanySize {
    if (!BANDS.includes(value as CompanySizeBand)) {
      throw new InvalidCompanySizeError(value);
    }
    return new CompanySize(value as CompanySizeBand);
  }

  static options(): ReadonlyArray<CompanySizeBand> {
    return BANDS;
  }

  toString(): string {
    return this.band;
  }
}
