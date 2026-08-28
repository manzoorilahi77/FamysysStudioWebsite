import { InvalidCompanySizeError } from "../errors/LeadErrors";

const BANDS = ["1-10", "11-50", "51-200", "201-500", "500+"] as const;

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
