import type { EngagementRepository } from "../../domain/engagement/repositories/EngagementRepository";
import type { FaqGroup, FaqPage } from "../../domain/faq/entities/FaqPage";
import type { FaqRepository } from "../../domain/faq/repositories/FaqRepository";
import type { FaqItem } from "../../domain/marketing/entities/FaqBlock";
import type { MarketingContentRepository } from "../../domain/marketing/repositories/MarketingContentRepository";
import type { ProcessRepository } from "../../domain/process/repositories/ProcessRepository";
import type { ServiceCatalogRepository } from "../../domain/services/repositories/ServiceCatalogRepository";

/**
 * Thrown when the FAQ page's grouping and the questions that exist have come apart. Both
 * directions are a defect rather than a condition to render around: a group naming a
 * question that is gone would print a heading over nothing, and a question no group names
 * would drop off the page without anything saying so. The message names the question, so
 * the fix is a one-line edit to faq.content.ts.
 */
export class FaqGroupingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FaqGroupingError";
  }
}

export interface FaqSources {
  readonly faq: FaqRepository;
  readonly marketingContent: MarketingContentRepository;
  readonly serviceCatalog: ServiceCatalogRepository;
  readonly process: ProcessRepository;
  readonly engagement: EngagementRepository;
}

/**
 * EVERY QUESTION ON THE SITE, IN ONE PLACE, GROUPED.
 *
 * The questions come from where they already live: the homepage's shared block of seven,
 * and the three inner pages, each of which carries a handful of the shared ones plus one
 * or two written for that page. They are gathered here rather than re-declared, so an
 * answer edited in the panel under any of those four owners is the answer this page
 * prints — there is no fifth copy to keep in step.
 *
 * DE-DUPLICATED BY QUESTION TEXT, first occurrence wins. The inner pages reuse the shared
 * entries verbatim by looking them up in the homepage's block, so a question that appears
 * on three pages is one item three times and is printed once. The homepage's block is
 * gathered first, which makes its copy of a shared answer the one that survives — the
 * panel edits shared entries there, so that is also the copy an editor expects to see.
 *
 * THEN RESOLVED INTO THE GROUPS THE CONTENT FILE DECLARES, and checked both ways. Every
 * question a group names has to exist, and every question that exists has to be named by
 * exactly one group. The check is what lets "nothing was lost" be a property of the page
 * rather than a thing somebody counted once.
 */
export class GetFaqPage {
  constructor(private readonly sources: FaqSources) {}

  async execute(): Promise<FaqPage> {
    const [structure, shared, services, process, engagement] = await Promise.all([
      this.sources.faq.getFaqPageStructure(),
      this.sources.marketingContent.getFaqBlock(),
      this.sources.serviceCatalog.getCreativeServicesPage(),
      this.sources.process.getHowWeWorkPage(),
      this.sources.engagement.getWaysToWorkPage(),
    ]);

    const byQuestion = collect([
      ...shared.items,
      ...services.faq.block.items,
      ...process.faq.block.items,
      ...engagement.faq.block.items,
    ]);

    const groups = structure.groups.map((group): FaqGroup => ({
      id: group.id,
      title: group.title,
      description: group.description,
      items: group.questions.map((question) => {
        const item = byQuestion.get(question);
        if (!item) {
          throw new FaqGroupingError(
            `The "${group.title}" group names a question that no page asks: "${question}".`,
          );
        }
        return item;
      }),
    }));

    assertEveryQuestionIsGrouped(byQuestion, groups);
    assertNoQuestionIsGroupedTwice(groups);

    return {
      hero: structure.hero,
      indexLabel: structure.indexLabel,
      groups,
      closingCta: structure.closingCta,
    };
  }
}

/** Items keyed by question, first occurrence kept. */
function collect(items: ReadonlyArray<FaqItem>): ReadonlyMap<string, FaqItem> {
  const map = new Map<string, FaqItem>();
  for (const item of items) {
    if (!map.has(item.question)) {
      map.set(item.question, item);
    }
  }
  return map;
}

function assertEveryQuestionIsGrouped(
  byQuestion: ReadonlyMap<string, FaqItem>,
  groups: ReadonlyArray<FaqGroup>,
): void {
  const grouped = new Set(groups.flatMap((group) => group.items.map((item) => item.question)));
  const orphans = [...byQuestion.keys()].filter((question) => !grouped.has(question));
  if (orphans.length > 0) {
    throw new FaqGroupingError(
      `${orphans.length} question(s) are asked on the site but belong to no group on the FAQ page: ` +
        orphans.map((question) => `"${question}"`).join(", ") +
        ". Add each to a group in faq.content.ts.",
    );
  }
}

function assertNoQuestionIsGroupedTwice(groups: ReadonlyArray<FaqGroup>): void {
  const seen = new Map<string, string>();
  for (const group of groups) {
    for (const item of group.items) {
      const previous = seen.get(item.question);
      if (previous) {
        throw new FaqGroupingError(
          `"${item.question}" is in both "${previous}" and "${group.title}". A question belongs to one group.`,
        );
      }
      seen.set(item.question, group.title);
    }
  }
}
