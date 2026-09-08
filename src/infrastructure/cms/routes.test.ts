import { beforeAll, describe, expect, it } from "vitest";
import type { CmsPage } from "../../domain/cms/entities/CmsPage";
import { recordTree } from "../../domain/cms/entities/CmsRecord";
import { addressKey } from "../../domain/cms/entities/ContentAddress";
import type { ContentAddress } from "../../domain/cms/entities/ContentAddress";
import { StaticAboutRepository } from "../content/repositories/StaticAboutRepository";
import { StaticContactRepository } from "../content/repositories/StaticContactRepository";
import { StaticEngagementRepository } from "../content/repositories/StaticEngagementRepository";
import { StaticMarketingContentRepository } from "../content/repositories/StaticMarketingContentRepository";
import { StaticPortfolioRepository } from "../content/repositories/StaticPortfolioRepository";
import { StaticProcessRepository } from "../content/repositories/StaticProcessRepository";
import { StaticServiceCatalogRepository } from "../content/repositories/StaticServiceCatalogRepository";
import { StaticCmsRepository } from "./StaticCmsRepository";
import { ALL_ROUTES, routesForOwners } from "./routes";

/**
 * THE TEST THAT STOPS A PUBLISH GOING SHORT.
 *
 * A publish that regenerates fewer pages than the edit appears on is the worst failure this
 * panel can have: the write succeeds, the panel says "published", and the same words are
 * still wrong on three other pages until somebody notices. It cannot be caught by looking at
 * the code, because the answer depends on the read model.
 *
 * So the model is built for real — the whole site, from the content modules — and every
 * owner in it is asked for its routes. An owner that resolves to nothing fails this test.
 */
const cms = new StaticCmsRepository({
  marketingContent: new StaticMarketingContentRepository(),
  serviceCatalog: new StaticServiceCatalogRepository(),
  process: new StaticProcessRepository(),
  engagement: new StaticEngagementRepository(),
  portfolio: new StaticPortfolioRepository(),
  about: new StaticAboutRepository(),
  contact: new StaticContactRepository(),
});

let pages: ReadonlyArray<CmsPage>;
let owners: ReadonlyArray<ContentAddress>;

beforeAll(async () => {
  pages = await cms.getPages();
  owners = [
    ...new Map(
      pages
        .flatMap((page) => page.sections)
        .flatMap((section) => recordTree(section))
        .flatMap((record) => (record.address ? [[addressKey(record.address), record.address]] : [])),
    ).values(),
  ] as ReadonlyArray<ContentAddress>;
});

describe("which routes a publish makes stale", () => {
  it("resolves every owner in the model to at least one route", () => {
    const orphans = owners.filter((owner) => routesForOwners(pages, [owner]).length === 0);

    expect(orphans.map(addressKey)).toEqual([]);
  });

  it("returns the routes of every page a shared record appears on, not just one", () => {
    // The six capabilities are blocks on Creative Services and cells in the homepage grid.
    const capability = owners.find((owner) => owner.key.startsWith("capabilities:"));
    expect(capability).toBeDefined();

    expect(routesForOwners(pages, [capability as ContentAddress])).toEqual([
      "/",
      "/creative-services",
    ]);
  });

  it("regenerates the whole site for the footer, which every route renders", () => {
    expect(routesForOwners(pages, [{ kind: "page_section", key: "home:footer" }])).toEqual(
      ALL_ROUTES,
    );
  });

  it("returns nothing for an owner the model does not have, rather than everything", () => {
    expect(routesForOwners(pages, [{ kind: "page_section", key: "blog:hero" }])).toEqual([]);
  });

  it("returns nothing when nothing was written", () => {
    expect(routesForOwners(pages, [])).toEqual([]);
  });
});
