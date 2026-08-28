import type { CaseStudy } from "../../../domain/portfolio/entities/CaseStudy";
import type { ShowreelClip } from "../../../domain/portfolio/entities/ShowreelClip";
import type { PortfolioRepository } from "../../../domain/portfolio/repositories/PortfolioRepository";

export class FakePortfolioRepository implements PortfolioRepository {
  storiesCalls = 0;
  caseStudiesCalls = 0;
  error: Error | undefined;

  constructor(
    private readonly stories: ReadonlyArray<ShowreelClip>,
    private readonly caseStudies: ReadonlyArray<CaseStudy>,
  ) {}

  async getFeaturedStories(): Promise<ReadonlyArray<ShowreelClip>> {
    this.storiesCalls += 1;
    if (this.error) {
      throw this.error;
    }
    return this.stories;
  }

  async getCaseStudies(): Promise<ReadonlyArray<CaseStudy>> {
    this.caseStudiesCalls += 1;
    if (this.error) {
      throw this.error;
    }
    return this.caseStudies;
  }
}
