import type { CapabilityDetail } from "../../../domain/services/entities/CapabilityDetail";
import type { CreativeServicesPage } from "../../../domain/services/entities/CreativeServicesPage";
import type { ServiceOffering } from "../../../domain/services/entities/ServiceOffering";
import type { ServiceCatalogRepository } from "../../../domain/services/repositories/ServiceCatalogRepository";
import { StaticServiceCatalogRepository } from "../../content/repositories/StaticServiceCatalogRepository";
import { ContentStore } from "../content/ContentStore";
import { closingCta } from "./DbMarketingContentRepository";
import { capabilities, media, pageFaqItems, processSteps, slug } from "./shared";

/**
 * /creative-services, read from the database.
 *
 * THE PATTERN THE FOUR PAGE REPOSITORIES SHARE, and why it is not the homepage's.
 *
 * These pages carry structure that is not copy and cannot be stored as copy: an anchor a
 * question links to, the slugs a progression stage references, a count derived from the
 * pieces themselves. So the page's own module supplies the SHAPE — spread in — and every
 * string is then replaced from `content_strings`. Nothing is inherited by accident: each
 * field below is written out, so a string that stayed behind is visible as a missing line
 * rather than as silence.
 *
 * `DbMarketingContentRepositoryTest` and this class's own test both assert the stronger
 * property that matters: with an unedited database, what comes out of here is what came
 * out of the static repository, field for field. That is the migration being correct,
 * checked rather than eyeballed.
 */
export class DbServiceCatalogRepository implements ServiceCatalogRepository {
  private readonly structure = new StaticServiceCatalogRepository();

  /** The homepage grid and the nav panel: title and one line, no page-length copy. */
  async getCapabilities(): Promise<ReadonlyArray<ServiceOffering>> {
    const { store, records } = await capabilities();
    return records.map((record) => ({
      title: store.text(record.ownerKey, "title"),
      description: store.text(record.ownerKey, "descriptor"),
    }));
  }

  async getCreativeServicesPage(): Promise<CreativeServicesPage> {
    const shape = await this.structure.getCreativeServicesPage();
    const [page, capability, steps] = await Promise.all([
      ContentStore.load("page_section", ["creative-services:"], { prefix: true }),
      capabilities(),
      processSteps(),
    ]);
    const faq = await pageFaqItems(shape.faq.block.items, page, "creative-services:faq");

    const hero = "creative-services:hero";
    const index = "creative-services:capability-index";
    const pointer = "creative-services:process-pointer";
    const engagement = "creative-services:engagement-pointer";
    const faqOwner = "creative-services:faq";

    return {
      hero: {
        eyebrow: page.text(hero, "eyebrow"),
        heading: page.text(hero, "heading"),
        body: page.text(hero, "body"),
        cta: page.cta(hero, "cta"),
        media: mediaWithAlt(shape.hero.media, page.text(hero, "media-alt")),
      },
      indexLabel: page.text(index, "index-label"),
      deliverablesLabel: page.text(index, "deliverables-label"),
      capabilities: capability.records.map((record): CapabilityDetail => ({
        slug: slug(record.slug),
        title: capability.store.text(record.ownerKey, "title"),
        description: capability.store.text(record.ownerKey, "descriptor"),
        expandedCopy: capability.store.text(record.ownerKey, "expanded-copy"),
        deliverables: capability.store.list(record.ownerKey, "what-s-included"),
        media: media(record, capability.store.text(record.ownerKey, "media-alt")),
        cta: capability.store.cta(record.ownerKey, "cta"),
      })),
      processPointer: {
        eyebrow: page.text(pointer, "eyebrow"),
        process: {
          heading: page.text(pointer, "heading"),
          // The reveal label belongs to the homepage's frames, which this page does not
          // render; it is carried through from the shape rather than stored twice.
          revealLabel: shape.processPointer.process.revealLabel,
          steps: steps.records.map((record) => ({
            title: steps.store.text(record.ownerKey, "title"),
            description: steps.store.text(record.ownerKey, "description"),
          })),
        },
        cta: page.cta(pointer, "cta"),
      },
      engagementPointer: {
        eyebrow: page.text(engagement, "eyebrow"),
        heading: page.text(engagement, "heading"),
        body: page.text(engagement, "body"),
        // The tier NAMES are the tiers' own; only the one-line summary belongs to this
        // page, which is why the names are spread and the lines are read.
        summaries: page.list(engagement, "summary-lines").map((line, position) => ({
          name: shape.engagementPointer.summaries[position]?.name ?? "",
          line,
        })),
        cta: page.cta(engagement, "cta"),
      },
      faq: {
        eyebrow: page.text(faqOwner, "eyebrow"),
        heading: page.text(faqOwner, "heading"),
        // Which /faq group the pointer opens: structure, from the module, like the slugs.
        group: shape.faq.group,
        block: { items: faq },
      },
      closingCta: closingCta(page, "creative-services:closing-cta"),
    };
  }
}

/** The file stays as the module has it; the description of it comes from the database. */
export function mediaWithAlt(
  reference: {
    readonly src: { value: string };
    readonly kind: string;
    readonly aspectRatio: string;
  },
  alt: string,
) {
  return media(
    {
      media_path: reference.src.value,
      media_kind: reference.kind,
      media_ratio: reference.aspectRatio,
    },
    alt,
  );
}
