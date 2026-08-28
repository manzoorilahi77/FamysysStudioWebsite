import type { CaseStudy } from "../../../domain/portfolio/entities/CaseStudy";
import type { ShowreelClip } from "../../../domain/portfolio/entities/ShowreelClip";
import type { PortfolioRepository } from "../../../domain/portfolio/repositories/PortfolioRepository";
import { caseStudies, featuredStories } from "../static/portfolio.content";

export class StaticPortfolioRepository implements PortfolioRepository {
  async getFeaturedStories(): Promise<ReadonlyArray<ShowreelClip>> {
    return featuredStories;
  }

  async getCaseStudies(): Promise<ReadonlyArray<CaseStudy>> {
    return caseStudies;
  }
}
