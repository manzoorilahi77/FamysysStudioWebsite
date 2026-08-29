import type { CaseStudy } from "../../../domain/portfolio/entities/CaseStudy";
import type { PortfolioRepository } from "../../../domain/portfolio/repositories/PortfolioRepository";
import { caseStudies } from "../static/portfolio.content";

export class StaticPortfolioRepository implements PortfolioRepository {
  async getCaseStudies(): Promise<ReadonlyArray<CaseStudy>> {
    return caseStudies;
  }
}
