// @vitest-environment node
import { readFileSync } from "node:fs";
import { afterAll, describe, expect, it } from "vitest";
import { StaticAboutRepository } from "../../content/repositories/StaticAboutRepository";
import { StaticContactRepository } from "../../content/repositories/StaticContactRepository";
import { StaticEngagementRepository } from "../../content/repositories/StaticEngagementRepository";
import { StaticMarketingContentRepository } from "../../content/repositories/StaticMarketingContentRepository";
import { StaticNavigationRepository } from "../../content/repositories/StaticNavigationRepository";
import { StaticPortfolioRepository } from "../../content/repositories/StaticPortfolioRepository";
import { StaticProcessRepository } from "../../content/repositories/StaticProcessRepository";
import { StaticServiceCatalogRepository } from "../../content/repositories/StaticServiceCatalogRepository";
import { closePool, isReachable } from "../pool";
import { DbAboutRepository } from "./DbAboutRepository";
import { DbContactRepository } from "./DbContactRepository";
import { DbEngagementRepository } from "./DbEngagementRepository";
import { DbMarketingContentRepository } from "./DbMarketingContentRepository";
import { DbNavigationRepository } from "./DbNavigationRepository";
import { DbPortfolioRepository } from "./DbPortfolioRepository";
import { DbProcessRepository } from "./DbProcessRepository";
import { DbServiceCatalogRepository } from "./DbServiceCatalogRepository";

/**
 * THE MIGRATION IS CORRECT IF THE DATABASE ANSWERS WHAT THE FILES ANSWER.
 *
 * Not "the pages look right" — that is a screenshot, and a screenshot cannot tell a
 * missing alt attribute from a present one, or notice that two capabilities swapped
 * places. Every read on every site repository is compared field for field against the
 * TypeScript module it was seeded from. Twenty reads, the whole content model, exactly.
 *
 * It runs only against a SEEDED database and skips otherwise, so a checkout with no
 * credentials still has a green suite. That is a real limitation and worth naming: on a
 * machine with no database this file proves nothing, so it belongs in the pre-deploy
 * check as much as in the test run.
 *
 * IT IS READ-ONLY. Nothing here writes, so running it cannot disturb content someone is
 * editing.
 */

/** Tests do not go through Next, so the credentials have to be read here. */
function loadEnvLocal(): void {
  let text: string;
  try {
    text = readFileSync(".env.local", "utf8");
  } catch {
    return;
  }
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    if (!process.env[key]) process.env[key] = line.slice(separator + 1).trim();
  }
}

loadEnvLocal();

const available = process.env.DB_HOST ? await isReachable() : false;

/**
 * Value objects are class instances, and two instances holding the same string are not
 * `toEqual` to each other in every case the entity graph produces. Comparing the plain
 * projection compares what the page actually renders.
 */
function plain(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(plain);
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as object).sort()) {
      out[key] = plain((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}

afterAll(async () => {
  if (available) await closePool();
});

describe.skipIf(!available)("the database answers what the content files answer", () => {
  it("the homepage, all ten blocks", async () => {
    const files = new StaticMarketingContentRepository();
    const database = new DbMarketingContentRepository();

    expect(plain(await database.getHero())).toEqual(plain(await files.getHero()));
    expect(plain(await database.getWhatWeDoIntro())).toEqual(plain(await files.getWhatWeDoIntro()));
    expect(plain(await database.getDifferentiatorBlock())).toEqual(
      plain(await files.getDifferentiatorBlock()),
    );
    expect(plain(await database.getProcessBlock())).toEqual(plain(await files.getProcessBlock()));
    expect(plain(await database.getWaysToWorkBlock())).toEqual(
      plain(await files.getWaysToWorkBlock()),
    );
    expect(plain(await database.getWorkIntro())).toEqual(plain(await files.getWorkIntro()));
    expect(plain(await database.getWhyFamysysBlock())).toEqual(
      plain(await files.getWhyFamysysBlock()),
    );
    expect(plain(await database.getFaqBlock())).toEqual(plain(await files.getFaqBlock()));
    expect(plain(await database.getClosingCta())).toEqual(plain(await files.getClosingCta()));
    expect(plain(await database.getFooterContent())).toEqual(plain(await files.getFooterContent()));
  });

  it("/creative-services, and the six capabilities the homepage grid shares with it", async () => {
    const files = new StaticServiceCatalogRepository();
    const database = new DbServiceCatalogRepository();

    expect(plain(await database.getCapabilities())).toEqual(plain(await files.getCapabilities()));
    expect(plain(await database.getCreativeServicesPage())).toEqual(
      plain(await files.getCreativeServicesPage()),
    );
  });

  it("/how-we-work", async () => {
    expect(plain(await new DbProcessRepository().getHowWeWorkPage())).toEqual(
      plain(await new StaticProcessRepository().getHowWeWorkPage()),
    );
  });

  it("/ways-to-work-with-us, including the lists split from the approved sentences", async () => {
    expect(plain(await new DbEngagementRepository().getWaysToWorkPage())).toEqual(
      plain(await new StaticEngagementRepository().getWaysToWorkPage()),
    );
  });

  it("/selected-work, and the eight tiles the homepage shows with different covers", async () => {
    const files = new StaticPortfolioRepository();
    const database = new DbPortfolioRepository();

    expect(plain(await database.getCaseStudies())).toEqual(plain(await files.getCaseStudies()));
    expect(plain(await database.getSelectedWorkPage())).toEqual(
      plain(await files.getSelectedWorkPage()),
    );
  });

  it("/about", async () => {
    expect(plain(await new DbAboutRepository().getAboutPage())).toEqual(
      plain(await new StaticAboutRepository().getAboutPage()),
    );
  });

  it("/contact", async () => {
    expect(plain(await new DbContactRepository().getContactPage())).toEqual(
      plain(await new StaticContactRepository().getContactPage()),
    );
  });

  // The menu has no copy of its own: every name in it is read from the thing it points at.
  it("the navigation menu, whose every word comes from a collection", async () => {
    expect(plain(await new DbNavigationRepository().getPrimaryMenu())).toEqual(
      plain(await new StaticNavigationRepository().getPrimaryMenu()),
    );
  });
});
