import type { CaseStudy } from "../../../domain/portfolio/entities/CaseStudy";
import type { PortfolioRepository } from "../../../domain/portfolio/repositories/PortfolioRepository";

export class FakePortfolioRepository implements PortfolioRepository {
  caseStudiesCalls = 0;
  error: Error | undefined;

  constructor(private readonly caseStudies: ReadonlyArray<CaseStudy>) {}

  async getCaseStudies(): Promise<ReadonlyArray<CaseStudy>> {
    this.caseStudiesCalls += 1;
    if (this.error) {
      throw this.error;
    }
    return this.caseStudies;
  }
}
