import type {
  CustomPartnershipDetail,
  EngagementTierDetail,
} from "../../../domain/engagement/entities/EngagementTierDetail";
import type { WaysToWorkPage } from "../../../domain/engagement/entities/WaysToWorkPage";
import type { EngagementRepository } from "../../../domain/engagement/repositories/EngagementRepository";
import { StaticEngagementRepository } from "../../content/repositories/StaticEngagementRepository";
import { ContentStore } from "../content/ContentStore";
import { closingCta } from "./DbMarketingContentRepository";
import { engagementTiers, media, pageFaqItems, slug, tierListItems } from "./shared";

/**
 * /ways-to-work-with-us, read from the database.
 *
 * `idealForItems` and `typicalWorkItems` are SPLIT from the approved sentences rather
 * than stored — there is one string in the database and the bulleted version is a
 * rendering of it. Storing both would let a bullet say something the sentence does not,
 * which is exactly the drift the round-trip test in the content layer exists to prevent.
 *
 * The how-to-choose answers link to a tier by slug. Slugs are structure, not copy, so
 * they come from the page module; the question and the answer come from the database.
 */
export class DbEngagementRepository implements EngagementRepository {
  private readonly structure = new StaticEngagementRepository();

  async getWaysToWorkPage(): Promise<WaysToWorkPage> {
    const shape = await this.structure.getWaysToWorkPage();
    const [page, tiers] = await Promise.all([
      ContentStore.load("page_section", ["ways-to-work-with-us:"], { prefix: true }),
      engagementTiers(),
    ]);
    const faq = await pageFaqItems(shape.faq.block.items, page, "ways-to-work-with-us:faq");

    const hero = "ways-to-work-with-us:hero";
    const comparison = "ways-to-work-with-us:tier-comparison";
    const choose = "ways-to-work-with-us:how-to-choose";
    const scoping = "ways-to-work-with-us:scoping";
    const faqOwner = "ways-to-work-with-us:faq";

    const named = tiers.records.filter((record) => record.is_custom === 0);
    const customRow = tiers.records.find((record) => record.is_custom === 1);
    if (!customRow) {
      throw new Error("No custom engagement tier in the database. Run `npm run db:seed`.");
    }

    const detail = named.map((record): EngagementTierDetail => {
      const idealFor = tiers.store.text(record.ownerKey, "ideal-for");
      const typicalWork = tiers.store.text(record.ownerKey, "typical-work-includes");
      return {
        slug: slug(record.slug),
        name: tiers.store.text(record.ownerKey, "name"),
        descriptor: tiers.store.text(record.ownerKey, "descriptor"),
        summary: tiers.store.text(record.ownerKey, "summary"),
        idealFor,
        typicalWork,
        idealForItems: tierListItems(idealFor),
        typicalWorkItems: tierListItems(typicalWork),
        expandedCopy: tiers.store.text(record.ownerKey, "expanded-copy"),
        bestWhen: tiers.store.text(record.ownerKey, "best-when"),
        engagementShape: tiers.store.text(record.ownerKey, "engagement-shape"),
        media: media(record, tiers.store.text(record.ownerKey, "media-alt")),
        cta: tiers.store.cta(record.ownerKey, "cta"),
      };
    });

    const custom: CustomPartnershipDetail = {
      slug: slug(customRow.slug),
      name: tiers.store.text(customRow.ownerKey, "name"),
      descriptor: tiers.store.text(customRow.ownerKey, "descriptor"),
      summary: tiers.store.text(customRow.ownerKey, "summary"),
      invitation: tiers.store.text(customRow.ownerKey, "invitation"),
      expandedCopy: tiers.store.text(customRow.ownerKey, "expanded-copy"),
      coversLabel: tiers.store.text(customRow.ownerKey, "covers-label"),
      covers: tiers.store.list(customRow.ownerKey, "what-a-partnership-usually-covers"),
      media: media(customRow, tiers.store.text(customRow.ownerKey, "media-alt")),
      cta: tiers.store.cta(customRow.ownerKey, "cta"),
    };

    const answers = page.list(choose, "answers");

    return {
      hero: {
        eyebrow: page.text(hero, "eyebrow"),
        heading: page.text(hero, "heading"),
        body: page.text(hero, "body"),
        cta: page.cta(hero, "cta"),
      },
      comparison: {
        eyebrow: page.text(comparison, "eyebrow"),
        heading: page.text(comparison, "heading"),
        body: page.text(comparison, "body"),
        caption: page.text(comparison, "caption"),
        rowLabels: {
          idealFor: page.text(comparison, "row-label-ideal-for"),
          typicalWork: page.text(comparison, "row-label-typical-work"),
          bestWhen: page.text(comparison, "row-label-best-when"),
          engagementShape: page.text(comparison, "row-label-engagement-shape"),
        },
      },
      tiers: detail,
      custom,
      howToChoose: {
        eyebrow: page.text(choose, "eyebrow"),
        heading: page.text(choose, "heading"),
        body: page.text(choose, "body"),
        questions: page.list(choose, "questions").map((question, index) => {
          const target = shape.howToChoose.questions[index];
          const tier = [...detail, custom].find((entry) => entry.slug.value === target?.tierSlug);
          return {
            question,
            answer: answers[index] ?? "",
            tierSlug: target?.tierSlug ?? "",
            // The tier's name as the database has it, so renaming a tier renames it here.
            tierName: tier?.name ?? target?.tierName ?? "",
          };
        }),
      },
      scoping: {
        eyebrow: page.text(scoping, "eyebrow"),
        heading: page.text(scoping, "heading"),
        body: page.text(scoping, "body"),
        steps: page.list(scoping, "step-titles").map((title, index) => ({
          title,
          body: page.list(scoping, "step-bodies")[index] ?? "",
        })),
      },
      faq: {
        eyebrow: page.text(faqOwner, "eyebrow"),
        heading: page.text(faqOwner, "heading"),
        block: { items: faq },
      },
      closingCta: closingCta(page, "ways-to-work-with-us:closing-cta"),
    };
  }
}
