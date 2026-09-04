import type { HowWeWorkPage } from "../../../domain/process/entities/HowWeWorkPage";
import type { ProcessStepDetail } from "../../../domain/process/entities/ProcessStepDetail";
import type { ProcessRepository } from "../../../domain/process/repositories/ProcessRepository";
import { StaticProcessRepository } from "../../content/repositories/StaticProcessRepository";
import { ContentStore } from "../content/ContentStore";
import { closingCta } from "./DbMarketingContentRepository";
import { caseStudies, media, pageFaqItems, processSteps, slug } from "./shared";

/**
 * /how-we-work, read from the database.
 *
 * The worked example is the one place a page quotes another collection: it walks ONE
 * piece of work through the five steps, and its title and description are the portfolio's
 * approved copy rather than a restatement. It is read from `case_studies` here for the
 * same reason the module reads it from `caseStudies` there — a second copy of an approved
 * string is a second thing to keep in step.
 */
export class DbProcessRepository implements ProcessRepository {
  private readonly structure = new StaticProcessRepository();

  async getHowWeWorkPage(): Promise<HowWeWorkPage> {
    const shape = await this.structure.getHowWeWorkPage();
    const [page, steps, work] = await Promise.all([
      ContentStore.load("page_section", ["how-we-work:"], { prefix: true }),
      processSteps(),
      caseStudies(),
    ]);
    const faq = await pageFaqItems(shape.faq.block.items, page, "how-we-work:faq");

    const hero = "how-we-work:hero";
    const overview = "how-we-work:process-overview";
    const example = "how-we-work:worked-example";
    const scope = "how-we-work:scope-and-revisions";
    const faqOwner = "how-we-work:faq";

    // The example's piece is identified by its approved title in the module. Resolving it
    // by that title here keeps the two in step without storing the choice twice.
    const piece = work.records.find(
      (record) => work.store.text(record.ownerKey, "title") === shape.workedExample.pieceTitle,
    );

    const stepDetails = steps.records.map((record): ProcessStepDetail => ({
      slug: slug(record.slug),
      title: steps.store.text(record.ownerKey, "title"),
      description: steps.store.text(record.ownerKey, "description"),
      expandedCopy: steps.store.text(record.ownerKey, "expanded-copy"),
      whatWeNeed: steps.store.list(record.ownerKey, "what-we-need-from-you"),
      whatYouGet: steps.store.list(record.ownerKey, "what-you-get"),
      media: media(record, steps.store.text(record.ownerKey, "media-alt")),
    }));

    return {
      hero: {
        eyebrow: page.text(hero, "eyebrow"),
        heading: page.text(hero, "heading"),
        body: page.text(hero, "body"),
        cta: page.cta(hero, "cta"),
      },
      overviewLabel: page.text(overview, "overview-label"),
      whatWeNeedLabel: page.text(overview, "what-we-need-label"),
      whatYouGetLabel: page.text(overview, "what-you-get-label"),
      steps: stepDetails,
      workedExample: {
        eyebrow: page.text(example, "eyebrow"),
        heading: page.text(example, "heading"),
        illustrativeNote: page.text(example, "illustrative-note"),
        pieceTitle: piece
          ? work.store.text(piece.ownerKey, "title")
          : shape.workedExample.pieceTitle,
        pieceDescription: piece
          ? work.store.text(piece.ownerKey, "intent-line")
          : shape.workedExample.pieceDescription,
        // Each stage names the step it belongs to, so a reordered process cannot
        // re-label the narrative — the titles come from the steps themselves.
        stages: page.list(example, "stage-copy").map((text, index) => ({
          stepTitle: stepDetails[index]?.title ?? "",
          text,
        })),
      },
      scope: {
        eyebrow: page.text(scope, "eyebrow"),
        heading: page.text(scope, "heading"),
        body: page.text(scope, "body"),
        topics: page.list(scope, "topic-titles").map((title, index) => ({
          title,
          body: page.list(scope, "topic-bodies")[index] ?? "",
        })),
      },
      faq: {
        eyebrow: page.text(faqOwner, "eyebrow"),
        heading: page.text(faqOwner, "heading"),
        block: { items: faq },
      },
      closingCta: closingCta(page, "how-we-work:closing-cta"),
    };
  }
}
