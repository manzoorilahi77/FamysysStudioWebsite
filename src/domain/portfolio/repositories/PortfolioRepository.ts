import type { CaseStudy } from "../entities/CaseStudy";
import type { SelectedWorkPage } from "../entities/SelectedWorkPage";

/**
 * Two reads, deliberately separate. The homepage wants the eight summaries and nothing
 * else; the Selected Work page wants those same eight expanded plus the surrounding page.
 * Folding them into one method would make the homepage await copy it never renders.
 *
 * Unlike `/how-we-work` and `/ways-to-work-with-us`, this page did not get a new bounded
 * context — `domain/portfolio/` already existed and this page is its natural home.
 */
export interface PortfolioRepository {
  getCaseStudies(): Promise<ReadonlyArray<CaseStudy>>;
  getSelectedWorkPage(): Promise<SelectedWorkPage>;
}
