import type { CaseStudy } from "../entities/CaseStudy";
import type { ShowreelClip } from "../entities/ShowreelClip";

export interface PortfolioRepository {
  getFeaturedStories(): Promise<ReadonlyArray<ShowreelClip>>;
  getCaseStudies(): Promise<ReadonlyArray<CaseStudy>>;
}
