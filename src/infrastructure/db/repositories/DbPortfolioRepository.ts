import type { CaseStudy } from "../../../domain/portfolio/entities/CaseStudy";
import type { CaseStudyDetail } from "../../../domain/portfolio/entities/CaseStudyDetail";
import type { SelectedWorkPage } from "../../../domain/portfolio/entities/SelectedWorkPage";
import type { PortfolioRepository } from "../../../domain/portfolio/repositories/PortfolioRepository";
import { StaticPortfolioRepository } from "../../content/repositories/StaticPortfolioRepository";
import { ContentStore, mediaFrom } from "../content/ContentStore";
import { closingCta } from "./DbMarketingContentRepository";
import { capabilities, caseStudies, caseStudyCapabilitySlugs, slug } from "./shared";

/**
 * /selected-work and the homepage's eight tiles, read from the database.
 *
 * TWO COVERS PER PIECE, and they are not the same image. The homepage tile is a summary
 * at grid scale; the page carries one sized and cropped for a page-scale grid. Both paths
 * and both alt texts are stored, which is why `case_studies` has two sets of media
 * columns rather than one.
 *
 * The filter chips and their counts are DERIVED from the pieces — a category cannot exist
 * with nothing behind it — so they are computed here rather than stored, exactly as the
 * content module computes them.
 */
export class DbPortfolioRepository implements PortfolioRepository {
  private readonly structure = new StaticPortfolioRepository();

  async getCaseStudies(): Promise<ReadonlyArray<CaseStudy>> {
    const { store, records } = await caseStudies();
    return records.map((record) => ({
      slug: slug(record.slug),
      reference: record.reference,
      title: store.text(record.ownerKey, "title"),
      description: store.text(record.ownerKey, "intent-line"),
      media: mediaFrom(
        record.home_media_path,
        record.home_media_kind,
        record.home_media_ratio,
        store.text(record.ownerKey, "homepage-cover-alt-text"),
      ),
    }));
  }

  async getSelectedWorkPage(): Promise<SelectedWorkPage> {
    const shape = await this.structure.getSelectedWorkPage();
    const [page, work, capability, links] = await Promise.all([
      ContentStore.load("page_section", ["selected-work:"], { prefix: true }),
      caseStudies(),
      capabilities(),
      caseStudyCapabilitySlugs(),
    ]);

    const hero = "selected-work:hero";
    const framing = "selected-work:framing";
    const filters = "selected-work:filters";
    const gallery = "selected-work:gallery";
    const pieceDetail = "selected-work:piece-detail";
    const progression = "selected-work:progression";
    const crossLink = "selected-work:capability-links";

    const capabilityTitle = new Map(
      capability.records.map((record) => [
        record.slug,
        capability.store.text(record.ownerKey, "title"),
      ]),
    );
    const capabilityHref = (capabilitySlug: string) => `/creative-services#${capabilitySlug}`;

    const pieces = work.records.map((record): CaseStudyDetail => {
      const referenced = links.get(record.slug) ?? [];
      return {
        slug: slug(record.slug),
        reference: record.reference,
        title: work.store.text(record.ownerKey, "title"),
        description: work.store.text(record.ownerKey, "intent-line"),
        demonstrates: work.store.text(record.ownerKey, "demonstrates"),
        whyThisPiece: work.store.text(record.ownerKey, "why-this-piece"),
        capabilities: referenced.map((capabilitySlug) => ({
          title: capabilityTitle.get(capabilitySlug) ?? capabilitySlug,
          href: capabilityHref(capabilitySlug),
        })),
        media: mediaFrom(
          record.detail_media_path,
          record.detail_media_kind,
          record.detail_media_ratio,
          work.store.text(record.ownerKey, "media-alt"),
        ),
      };
    });

    // A chip per capability that at least one piece exercises, counted from the pieces.
    const counts = new Map<string, number>();
    for (const piece of pieces) {
      for (const reference of piece.capabilities) {
        counts.set(reference.title, (counts.get(reference.title) ?? 0) + 1);
      }
    }

    return {
      hero: {
        eyebrow: page.text(hero, "eyebrow"),
        heading: page.text(hero, "heading"),
        body: page.text(hero, "body"),
        cta: page.cta(hero, "cta"),
      },
      framing: {
        eyebrow: page.text(framing, "eyebrow"),
        heading: page.text(framing, "heading"),
        body: page.text(framing, "body"),
      },
      filter: {
        label: page.text(filters, "label"),
        allLabel: page.text(filters, "all-label"),
        categories: capability.records
          .map((record) => capability.store.text(record.ownerKey, "title"))
          .filter((title) => counts.has(title))
          .map((title) => ({ title, count: counts.get(title) ?? 0 })),
      },
      gridLabel: page.text(gallery, "grid-label"),
      statusLabel: page.text(gallery, "status-label"),
      statusExplanation: page.text(gallery, "status-explanation"),
      pieces,
      detail: {
        demonstratesLabel: page.text(pieceDetail, "demonstrates-label"),
        whyLabel: page.text(pieceDetail, "why-label"),
        capabilitiesLabel: page.text(pieceDetail, "capabilities-label"),
        mediaSlotLabel: page.text(pieceDetail, "media-slot-label"),
        closeLabel: page.text(pieceDetail, "close-label"),
      },
      progression: {
        eyebrow: page.text(progression, "eyebrow"),
        heading: page.text(progression, "heading"),
        body: page.text(progression, "body"),
        // Which pieces belong to which arc is structure the page decides, not copy.
        stages: page.list(progression, "stage-titles").map((title, index) => ({
          title,
          body: page.list(progression, "stage-bodies")[index] ?? "",
          pieceSlugs: shape.progression.stages[index]?.pieceSlugs ?? [],
        })),
      },
      capabilityCrossLink: {
        eyebrow: page.text(crossLink, "eyebrow"),
        heading: page.text(crossLink, "heading"),
        links: capability.records.map((record) => ({
          title: capability.store.text(record.ownerKey, "title"),
          href: capabilityHref(record.slug),
        })),
      },
      closingCta: closingCta(page, "selected-work:closing-cta"),
    };
  }
}
