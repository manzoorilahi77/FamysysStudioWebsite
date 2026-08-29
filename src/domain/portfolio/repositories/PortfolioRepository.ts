import type { CaseStudy } from "../entities/CaseStudy";

export interface PortfolioRepository {
  getCaseStudies(): Promise<ReadonlyArray<CaseStudy>>;
}
