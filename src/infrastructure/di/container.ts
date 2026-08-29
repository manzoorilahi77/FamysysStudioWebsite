import { StaticMarketingContentRepository } from "../content/repositories/StaticMarketingContentRepository";
import { StaticNavigationRepository } from "../content/repositories/StaticNavigationRepository";
import { StaticPortfolioRepository } from "../content/repositories/StaticPortfolioRepository";
import { StaticServiceCatalogRepository } from "../content/repositories/StaticServiceCatalogRepository";
import { HttpLeadRepository } from "../lead/HttpLeadRepository";
import { StubLeadRepository } from "../lead/StubLeadRepository";

/**
 * The composition root. This is the only file that constructs concrete
 * repositories — everything else (application use cases, presentation
 * components) depends on the domain repository interfaces and receives an
 * instance from here via constructor injection. Swapping a `Static*`
 * repository for a future CMS-backed one is a one-line change, here only.
 *
 * Repositories only, not use cases: infrastructure/ cannot import
 * application/ (see boundary rules), so use cases are constructed at the
 * call site — a server component imports both this container and the use
 * case class it needs, e.g. `new GetPrimaryNavigation(container.navigation)`.
 */
export const container = {
  navigation: new StaticNavigationRepository(),
  marketingContent: new StaticMarketingContentRepository(),
  serviceCatalog: new StaticServiceCatalogRepository(),
  portfolio: new StaticPortfolioRepository(),
  lead: new HttpLeadRepository(),
  // Used by the /api/demo-request route itself (the server-side target the
  // client-side HttpLeadRepository above POSTs to) — see StubLeadRepository.
  demoRequestIntake: new StubLeadRepository(),
} as const;
