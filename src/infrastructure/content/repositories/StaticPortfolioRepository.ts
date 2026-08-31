import type { CaseStudy } from "../../../domain/portfolio/entities/CaseStudy";
import type { SelectedWorkPage } from "../../../domain/portfolio/entities/SelectedWorkPage";
import type { PortfolioRepository } from "../../../domain/portfolio/repositories/PortfolioRepository";
import { caseStudies } from "../static/portfolio.content";
import { selectedWorkPage } from "../static/selected-work.content";

export class StaticPortfolioRepository implements PortfolioRepository {
  async getCaseStudies(): Promise<ReadonlyArray<CaseStudy>> {
    return caseStudies;
  }

  async getSelectedWorkPage(): Promise<SelectedWorkPage> {
    return selectedWorkPage;
  }
}
