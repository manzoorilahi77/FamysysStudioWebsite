import type { CaseStudy } from "../../domain/portfolio/entities/CaseStudy";
import type { ShowreelClip } from "../../domain/portfolio/entities/ShowreelClip";
import type { PortfolioRepository } from "../../domain/portfolio/repositories/PortfolioRepository";

export interface FeaturedWork {
  readonly stories: ReadonlyArray<ShowreelClip>;
  readonly caseStudies: ReadonlyArray<CaseStudy>;
}

export class GetFeaturedWork {
  constructor(private readonly repository: PortfolioRepository) {}

  async execute(): Promise<FeaturedWork> {
    const [stories, caseStudies] = await Promise.all([
      this.repository.getFeaturedStories(),
      this.repository.getCaseStudies(),
    ]);
    return { stories, caseStudies };
  }
}
