import type { ClosingCtaBlock } from "../../../domain/marketing/entities/ClosingCtaBlock";
import type { DifferentiatorBlock } from "../../../domain/marketing/entities/DifferentiatorBlock";
import type { FaqBlock, FaqItem } from "../../../domain/marketing/entities/FaqBlock";
import type { FooterContent } from "../../../domain/marketing/entities/FooterContent";
import type { HeroContent } from "../../../domain/marketing/entities/HeroContent";
import type { ProcessBlock } from "../../../domain/marketing/entities/ProcessBlock";
import type { SectionIntro } from "../../../domain/marketing/entities/SectionIntro";
import type { WaysToWorkBlock } from "../../../domain/marketing/entities/EngagementTier";
import type { WhyFamysysBlock } from "../../../domain/marketing/entities/WhyFamysysBlock";
import type {
  MarketingContentRepository,
  WhatWeDoIntro,
} from "../../../domain/marketing/repositories/MarketingContentRepository";
import { StaticMarketingContentRepository } from "../../content/repositories/StaticMarketingContentRepository";
import { ContentStore, mediaFrom } from "../content/ContentStore";
import { collectionRecordStore, faqItems, homeTiers } from "./shared";

/**
 * THE HOMEPAGE, READ FROM THE DATABASE.
 *
 * Ten methods, one per block, exactly as the interface has always had them. What changed
 * is where the strings come from — `content_strings`, addressed by the same section and
 * field keys the admin panel shows — and nothing above this layer can tell.
 *
 * WHAT STILL COMES FROM THE CONTENT MODULE, AND WHY.
 * The image files behind the hero mosaic, the four differentiator cards and the five
 * reasons: their PATHS and aspect ratios. Those are not copy — nobody edits them in a
 * text field, they are files that have to exist on disk in a particular shape — so they
 * are structure the module still owns, while every word beside them, alt text included,
 * comes from the database. The moment media upload exists they move too, and this class
 * is where that change lands.
 *
 * One store per read rather than one for the whole class: these methods are called from
 * server components during a build, and a cached store would serve a page from a snapshot
 * taken before the edit that triggered the rebuild.
 */
export class DbMarketingContentRepository implements MarketingContentRepository {
  /** Structure only — see the note above. Never a source of strings. */
  private readonly structure = new StaticMarketingContentRepository();

  private async home(): Promise<ContentStore> {
    return ContentStore.load("page_section", ["home:"], { prefix: true });
  }

  async getHero(): Promise<HeroContent> {
    const store = await this.home();
    const shape = await this.structure.getHero();
    const owner = "home:hero";
    return {
      heading: store.text(owner, "heading"),
      body: store.text(owner, "body"),
      primaryCta: store.cta(owner, "primary-cta"),
      secondaryCta: store.cta(owner, "secondary-cta"),
      supportingLine: store.text(owner, "supporting-line"),
      mosaicTiles: store
        .list(owner, "mosaic-alt-text")
        .map((alt, index) => withAlt(shape.mosaicTiles, index, alt)),
    };
  }

  async getWhatWeDoIntro(): Promise<WhatWeDoIntro> {
    const store = await this.home();
    const owner = "home:what-we-do";
    return { intro: intro(store, owner), cta: store.cta(owner, "cta") };
  }

  async getDifferentiatorBlock(): Promise<DifferentiatorBlock> {
    const store = await this.home();
    const shape = await this.structure.getDifferentiatorBlock();
    const owner = "home:differentiator";
    const titles = store.list(owner, "element-titles");
    const descriptions = store.list(owner, "element-descriptions");
    const alts = store.list(owner, "element-alt-text");
    return {
      heading: store.text(owner, "heading"),
      body: store.text(owner, "body"),
      leadIn: store.text(owner, "lead-in"),
      closingStatement: store.text(owner, "closing-statement"),
      elements: titles.map((title, index) => ({
        title,
        description: descriptions[index] ?? "",
        media: mediaAt(shape.elements, index, alts[index] ?? ""),
      })),
    };
  }

  /**
   * The homepage's five steps are the same five /how-we-work expands, which is why they
   * are read from the process_steps collection rather than from a list on this section.
   * The section's own list is the read-only echo the panel shows.
   */
  async getProcessBlock(): Promise<ProcessBlock> {
    const [store, steps] = await Promise.all([this.home(), collectionRecordStore("process-steps")]);
    return {
      heading: store.text("home:how-we-work", "heading"),
      steps: steps.records.map((record) => ({
        title: steps.store.text(record.ownerKey, "title"),
        description: steps.store.text(record.ownerKey, "description"),
      })),
    };
  }

  async getWaysToWorkBlock(): Promise<WaysToWorkBlock> {
    const store = await this.home();
    const owner = "home:ways-to-work";
    const { tiers, custom } = await homeTiers();
    return {
      heading: store.text(owner, "heading"),
      body: store.text(owner, "body"),
      tiers,
      custom,
    };
  }

  async getWorkIntro(): Promise<SectionIntro> {
    return intro(await this.home(), "home:selected-work");
  }

  async getWhyFamysysBlock(): Promise<WhyFamysysBlock> {
    const store = await this.home();
    const shape = await this.structure.getWhyFamysysBlock();
    const owner = "home:why-famysys";
    const titles = store.list(owner, "reason-titles");
    const descriptions = store.list(owner, "reason-descriptions");
    const alts = store.list(owner, "reason-alt-text");
    return {
      heading: store.text(owner, "heading"),
      body: store.text(owner, "body"),
      reasons: titles.map((title, index) => ({
        title,
        description: descriptions[index] ?? "",
        media: mediaAt(shape.reasons, index, alts[index] ?? ""),
      })),
    };
  }

  async getFaqBlock(): Promise<FaqBlock> {
    return { items: await faqItems("home") };
  }

  async getClosingCta(): Promise<ClosingCtaBlock> {
    return closingCta(await this.home(), "home:closing-cta");
  }

  /**
   * The legal and social lists are empty and stay empty: the brief supplies neither, and
   * an invented privacy policy link is worse than no link. They are shown read-only in
   * the panel with that reason, so there is nothing to read here.
   */
  async getFooterContent(): Promise<FooterContent> {
    const store = await this.home();
    const owner = "home:footer";
    return {
      tagline: store.text(owner, "tagline"),
      contactEmail: store.text(owner, "contact-email"),
      legalLinks: [],
      socialLinks: [],
    };
  }
}

// ---------------------------------------------------------------------------
// The three shapes that recur on every page.
// ---------------------------------------------------------------------------

export function intro(store: ContentStore, owner: string): SectionIntro {
  return {
    eyebrow: store.text(owner, "eyebrow"),
    heading: store.text(owner, "heading"),
    body: store.text(owner, "body"),
  };
}

export function closingCta(store: ContentStore, owner: string): ClosingCtaBlock {
  return {
    heading: store.text(owner, "heading"),
    body: store.text(owner, "body"),
    closingLine: store.text(owner, "closing-line"),
    cta: store.cta(owner, "cta"),
  };
}

export function faqBlockFrom(items: ReadonlyArray<FaqItem>): FaqBlock {
  return { items };
}

/**
 * The file and its shape from the structural entity, the alt text from the database.
 *
 * An index past the end means the database has more strings than the module has images,
 * which is a seeding mismatch rather than something to paper over — it throws, naming the
 * index, the same way a missing key does.
 */
function mediaAt(
  shape: ReadonlyArray<{
    readonly media: {
      readonly src: { value: string };
      readonly kind: string;
      readonly aspectRatio: string;
    };
  }>,
  index: number,
  alt: string,
) {
  const found = shape[index];
  if (!found) {
    throw new Error(
      `No image for element ${index}. The content module defines ${shape.length}; the database has more.`,
    );
  }
  return mediaFrom(found.media.src.value, found.media.kind, found.media.aspectRatio, alt);
}

function withAlt(
  shape: ReadonlyArray<{
    readonly src: { value: string };
    readonly kind: string;
    readonly aspectRatio: string;
  }>,
  index: number,
  alt: string,
) {
  const found = shape[index];
  if (!found) {
    throw new Error(
      `No image for tile ${index}. The content module defines ${shape.length}; the database has more.`,
    );
  }
  return mediaFrom(found.src.value, found.kind, found.aspectRatio, alt);
}
