import { StaticAboutRepository } from "../content/repositories/StaticAboutRepository";
import { StaticContactRepository } from "../content/repositories/StaticContactRepository";
import { StaticEngagementRepository } from "../content/repositories/StaticEngagementRepository";
import { StaticMarketingContentRepository } from "../content/repositories/StaticMarketingContentRepository";
import { StaticNavigationRepository } from "../content/repositories/StaticNavigationRepository";
import { StaticPortfolioRepository } from "../content/repositories/StaticPortfolioRepository";
import { StaticProcessRepository } from "../content/repositories/StaticProcessRepository";
import { StaticServiceCatalogRepository } from "../content/repositories/StaticServiceCatalogRepository";
import { contentSource } from "../db/env";
import { withStaticFallback } from "../db/fallback";
import { DbAboutRepository } from "../db/repositories/DbAboutRepository";
import { DbContactRepository } from "../db/repositories/DbContactRepository";
import { DbEngagementRepository } from "../db/repositories/DbEngagementRepository";
import { DbLeadRepository } from "../db/repositories/DbLeadRepository";
import { DbMarketingContentRepository } from "../db/repositories/DbMarketingContentRepository";
import { DbNavigationRepository } from "../db/repositories/DbNavigationRepository";
import { DbPortfolioRepository } from "../db/repositories/DbPortfolioRepository";
import { DbProcessRepository } from "../db/repositories/DbProcessRepository";
import { DbServiceCatalogRepository } from "../db/repositories/DbServiceCatalogRepository";
import { HttpLeadRepository } from "../lead/HttpLeadRepository";

/**
 * The composition root. This is the only file that constructs concrete repositories —
 * everything else (application use cases, presentation components) depends on the domain
 * repository interfaces and receives an instance from here via constructor injection.
 *
 * WHICH SOURCE, AND HOW IT IS CHOSEN.
 *
 * `CONTENT_SOURCE` picks: "database" (the default) reads MySQL, "static" reads the
 * TypeScript modules under content/static. On top of that, every database repository is
 * wrapped so that a database which cannot be REACHED hands over to its static
 * counterpart — see db/fallback.ts for why that fallback is deliberately narrow and does
 * not cover a missing row.
 *
 * Nothing above this line changed when the database arrived, which is what the layering
 * was for: the interfaces are the same, the call sites are the same, and this file is the
 * whole of the switch.
 *
 * Repositories only, not use cases: infrastructure/ cannot import application/ (see
 * boundary rules), so use cases are constructed at the call site — a server component
 * imports both this container and the use case class it needs, e.g.
 * `new GetPrimaryNavigation(container.navigation)`.
 */

const useDatabase = contentSource() === "database";

function source<T extends object>(database: () => T, files: () => T): T {
  if (!useDatabase) return files();
  return withStaticFallback(database(), files());
}

export const container = {
  navigation: source(
    () => new DbNavigationRepository(),
    () => new StaticNavigationRepository(),
  ),
  marketingContent: source(
    () => new DbMarketingContentRepository(),
    () => new StaticMarketingContentRepository(),
  ),
  serviceCatalog: source(
    () => new DbServiceCatalogRepository(),
    () => new StaticServiceCatalogRepository(),
  ),
  process: source(
    () => new DbProcessRepository(),
    () => new StaticProcessRepository(),
  ),
  engagement: source(
    () => new DbEngagementRepository(),
    () => new StaticEngagementRepository(),
  ),
  portfolio: source(
    () => new DbPortfolioRepository(),
    () => new StaticPortfolioRepository(),
  ),
  about: source(
    () => new DbAboutRepository(),
    () => new StaticAboutRepository(),
  ),
  contact: source(
    () => new DbContactRepository(),
    () => new StaticContactRepository(),
  ),
  /** The browser's side of the contact form: it POSTs, it does not touch the database. */
  lead: new HttpLeadRepository(),
  /**
   * The server side of that POST. No static fallback and no wrapper: an enquiry that
   * cannot be stored must fail loudly so the sender is told to try again, rather than be
   * accepted into nothing — which is exactly what StubLeadRepository used to do.
   */
  demoRequestIntake: new DbLeadRepository(),
} as const;
