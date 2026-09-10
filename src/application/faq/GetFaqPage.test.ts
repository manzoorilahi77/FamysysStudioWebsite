import { describe, expect, it } from "vitest";
import type { FaqPageStructure } from "../../domain/faq/entities/FaqPage";
import type { FaqItem } from "../../domain/marketing/entities/FaqBlock";
import { StaticEngagementRepository } from "../../infrastructure/content/repositories/StaticEngagementRepository";
import { StaticFaqRepository } from "../../infrastructure/content/repositories/StaticFaqRepository";
import { StaticMarketingContentRepository } from "../../infrastructure/content/repositories/StaticMarketingContentRepository";
import { StaticProcessRepository } from "../../infrastructure/content/repositories/StaticProcessRepository";
import { StaticServiceCatalogRepository } from "../../infrastructure/content/repositories/StaticServiceCatalogRepository";
import { faqPageStructure } from "../../infrastructure/content/static/faq.content";
import { FaqGroupingError, GetFaqPage, type FaqSources } from "./GetFaqPage";

/**
 * THE HAPPY PATH RUNS AGAINST THE REAL CONTENT, on purpose. A fixture would prove the
 * composer works on a fixture; what has to be proved is that the grouping in
 * faq.content.ts covers every question the site actually asks, with none lost and none
 * doubled — and that is a property of the real files, checked here every time they change.
 */
const realSources: FaqSources = {
  faq: new StaticFaqRepository(),
  marketingContent: new StaticMarketingContentRepository(),
  serviceCatalog: new StaticServiceCatalogRepository(),
  process: new StaticProcessRepository(),
  engagement: new StaticEngagementRepository(),
};

/** The count the audit found: seven on the homepage, plus one, two and two written for the inner pages. */
const UNIQUE_QUESTIONS_ON_THE_SITE = 12;

describe("GetFaqPage against the site's real content", () => {
  it("gathers every unique question on the site into the four groups, losing none", async () => {
    const page = await new GetFaqPage(realSources).execute();

    const printed = page.groups.flatMap((group) => group.items.map((item) => item.question));
    expect(printed).toHaveLength(UNIQUE_QUESTIONS_ON_THE_SITE);
    expect(new Set(printed).size).toBe(UNIQUE_QUESTIONS_ON_THE_SITE);
    expect(page.groups.map((group) => group.id)).toEqual([
      "working-with-us",
      "services-and-capability",
      "process-and-delivery",
      "pricing-and-engagement",
    ]);
  });

  it("prints the shared answers as the homepage's block has them, CTA included", async () => {
    const page = await new GetFaqPage(realSources).execute();
    const shared = await realSources.marketingContent.getFaqBlock();

    const cost = page.groups
      .flatMap((group) => group.items)
      .find((item) => item.question === "How much do your services cost?");
    const source = shared.items.find((item) => item.question === "How much do your services cost?");
    expect(cost).toEqual(source);
    expect(cost?.cta?.href.value).toBe("/contact");
  });

  it("counts the sources the audit counted: 7 + 4 + 4 + 4 placements, 12 unique", async () => {
    const [shared, services, process, engagement] = await Promise.all([
      realSources.marketingContent.getFaqBlock(),
      realSources.serviceCatalog.getCreativeServicesPage(),
      realSources.process.getHowWeWorkPage(),
      realSources.engagement.getWaysToWorkPage(),
    ]);
    const placements = [
      shared.items,
      services.faq.block.items,
      process.faq.block.items,
      engagement.faq.block.items,
    ];
    expect(placements.map((block) => block.length)).toEqual([7, 4, 4, 4]);
    expect(new Set(placements.flat().map((item) => item.question)).size).toBe(
      UNIQUE_QUESTIONS_ON_THE_SITE,
    );
  });

  it("points each inner page at a group that exists on the page", async () => {
    const [page, services, process, engagement] = await Promise.all([
      new GetFaqPage(realSources).execute(),
      realSources.serviceCatalog.getCreativeServicesPage(),
      realSources.process.getHowWeWorkPage(),
      realSources.engagement.getWaysToWorkPage(),
    ]);
    const ids = new Set(page.groups.map((group) => group.id));
    for (const target of [services.faq.group, process.faq.group, engagement.faq.group]) {
      expect(ids.has(target)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// The three ways the grouping can go stale, each refused with a message naming the fix.
// ---------------------------------------------------------------------------

function item(question: string): FaqItem {
  return { question, answer: `Answer to ${question}` };
}

/** Sources holding exactly the questions given, with the homepage's block as the only owner. */
function sourcesWith(
  questions: ReadonlyArray<string>,
  structure: FaqPageStructure,
  servicesQuestions: ReadonlyArray<FaqItem> = [],
): FaqSources {
  const empty = { faq: { eyebrow: "", heading: "", group: "", block: { items: [] } } };
  return {
    faq: { getFaqPageStructure: async () => structure },
    marketingContent: {
      getFaqBlock: async () => ({ items: questions.map(item) }),
    } as unknown as FaqSources["marketingContent"],
    serviceCatalog: {
      getCreativeServicesPage: async () => ({
        faq: { ...empty.faq, block: { items: servicesQuestions } },
      }),
    } as unknown as FaqSources["serviceCatalog"],
    process: { getHowWeWorkPage: async () => empty } as unknown as FaqSources["process"],
    engagement: { getWaysToWorkPage: async () => empty } as unknown as FaqSources["engagement"],
  };
}

function structureWith(groups: ReadonlyArray<readonly [string, ReadonlyArray<string>]>): FaqPageStructure {
  return {
    ...faqPageStructure,
    groups: groups.map(([id, questions]) => ({ id, title: id, description: "", questions })),
  };
}

describe("GetFaqPage refuses a grouping that has come apart from the questions", () => {
  it("throws when a group names a question no page asks", async () => {
    const sources = sourcesWith(["A?"], structureWith([["g", ["A?", "Gone?"]]]));

    await expect(new GetFaqPage(sources).execute()).rejects.toThrow(FaqGroupingError);
    await expect(new GetFaqPage(sources).execute()).rejects.toThrow('"Gone?"');
  });

  it("throws when a question is asked on the site but belongs to no group", async () => {
    const sources = sourcesWith(["A?", "Orphan?"], structureWith([["g", ["A?"]]]));

    await expect(new GetFaqPage(sources).execute()).rejects.toThrow(FaqGroupingError);
    await expect(new GetFaqPage(sources).execute()).rejects.toThrow('"Orphan?"');
  });

  it("throws when a question is placed in two groups", async () => {
    const sources = sourcesWith(
      ["A?", "B?"],
      structureWith([
        ["g1", ["A?"]],
        ["g2", ["A?", "B?"]],
      ]),
    );

    await expect(new GetFaqPage(sources).execute()).rejects.toThrow(FaqGroupingError);
    await expect(new GetFaqPage(sources).execute()).rejects.toThrow('"A?" is in both');
  });

  it("keeps the first copy of a question that appears on more than one page", async () => {
    // The service page carries the same question with a different answer — the shared
    // (homepage) copy is the one the panel edits, and the one that must survive.
    const sources = sourcesWith(["A?"], structureWith([["g", ["A?"]]]), [
      { question: "A?", answer: "a stale copy" },
    ]);

    const page = await new GetFaqPage(sources).execute();

    expect(page.groups[0]?.items[0]?.answer).toBe("Answer to A?");
  });
});
