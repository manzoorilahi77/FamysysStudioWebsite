import type { HowWeWorkPage } from "../entities/HowWeWorkPage";

/**
 * The How We Work page's own source. Deliberately not an eleventh method on
 * `MarketingContentRepository`: that interface is the homepage's aggregate, and
 * `GetHomepageContent` awaits every one of its methods. Hanging an inner page off it
 * would make the homepage's fixture grow a field it never reads.
 *
 * The page's entities still extend the marketing ones — `ProcessStepDetail` over
 * `ProcessStep` — so the five approved steps keep one definition regardless of which
 * repository serves them.
 */
export interface ProcessRepository {
  getHowWeWorkPage(): Promise<HowWeWorkPage>;
}
