import type { WaysToWorkPage } from "../entities/WaysToWorkPage";

/**
 * The Ways to Work With Us page's own source. Deliberately not another method on
 * `MarketingContentRepository`, for the same reason `ProcessRepository` is not: that
 * interface is the homepage's aggregate and `GetHomepageContent` awaits every method on
 * it, so an inner page hung off it would make the homepage's fixture grow a field it
 * never reads.
 *
 * The page's entities still extend the marketing ones — `EngagementTierDetail` over
 * `EngagementTier` — so the four tiers keep one definition regardless of which
 * repository serves them.
 */
export interface EngagementRepository {
  getWaysToWorkPage(): Promise<WaysToWorkPage>;
}
