import type { CaseStudy } from "../../../domain/portfolio/entities/CaseStudy";
import type { SelectedWorkPage } from "../../../domain/portfolio/entities/SelectedWorkPage";
import type { PortfolioRepository } from "../../../domain/portfolio/repositories/PortfolioRepository";

export class FakePortfolioRepository implements PortfolioRepository {
  caseStudiesCalls = 0;
  selectedWorkPageCalls = 0;
  error: Error | undefined;

  constructor(
    private readonly caseStudies: ReadonlyArray<CaseStudy>,
    private readonly selectedWorkPage?: SelectedWorkPage,
  ) {}

  async getCaseStudies(): Promise<ReadonlyArray<CaseStudy>> {
    this.caseStudiesCalls += 1;
    if (this.error) {
      throw this.error;
    }
    return this.caseStudies;
  }

  async getSelectedWorkPage(): Promise<SelectedWorkPage> {
    this.selectedWorkPageCalls += 1;
    if (this.error) {
      throw this.error;
    }
    if (!this.selectedWorkPage) {
      throw new Error("This fake was constructed without a Selected Work page.");
    }
    return this.selectedWorkPage;
  }
}
