import type { CaseStudy } from "../../domain/portfolio/entities/CaseStudy";
import type { PortfolioRepository } from "../../domain/portfolio/repositories/PortfolioRepository";

export class GetFeaturedWork {
  constructor(private readonly repository: PortfolioRepository) {}

  async execute(): Promise<ReadonlyArray<CaseStudy>> {
    return this.repository.getCaseStudies();
  }
}
