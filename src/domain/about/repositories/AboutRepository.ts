import type { AboutPage } from "../entities/AboutPage";

/**
 * Its own bounded context rather than another method on `MarketingContentRepository`,
 * for the same reason `process` and `engagement` are separate: `GetHomepageContent`
 * awaits every method on that interface, and the homepage would then load a page it
 * never renders.
 */
export interface AboutRepository {
  getAboutPage(): Promise<AboutPage>;
}
