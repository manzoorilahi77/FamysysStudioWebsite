import type { ContactPage } from "../entities/ContactPage";

/**
 * Its own bounded context rather than another method on `MarketingContentRepository`,
 * for the same reason `about`, `process` and `engagement` are: `GetHomepageContent`
 * awaits every method on that interface, and the homepage would then load a page it
 * never renders.
 */
export interface ContactRepository {
  getContactPage(): Promise<ContactPage>;
}
