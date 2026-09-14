import type { ClosingCtaBlock } from "../../../domain/marketing/entities/ClosingCtaBlock";
import type { DifferentiatorBlock } from "../../../domain/marketing/entities/DifferentiatorBlock";
import type { FaqBlock, FaqItem } from "../../../domain/marketing/entities/FaqBlock";
import type { FooterContent } from "../../../domain/marketing/entities/FooterContent";
import type { HeroContent } from "../../../domain/marketing/entities/HeroContent";
import type { MediaRef } from "../../../domain/shared/value-objects/MediaRef";
import type { ProcessBlock } from "../../../domain/marketing/entities/ProcessBlock";
import type { SectionIntro } from "../../../domain/marketing/entities/SectionIntro";
import type { WaysToWorkBlock } from "../../../domain/marketing/entities/EngagementTier";
import type { WhyFamysysBlock } from "../../../domain/marketing/entities/WhyFamysysBlock";
import type {
  MarketingContentRepository,
  WhatWeDoIntro,
} from "../../../domain/marketing/repositories/MarketingContentRepository";
import { StaticMarketingContentRepository } from "../../content/repositories/StaticMarketingContentRepository";
import { ContentStore } from "../content/ContentStore";
import { collectionRecordStore, faqItems, homeTiers, pageMedia } from "./shared";

/**
 * THE HOMEPAGE, READ FROM THE DATABASE.
 *
 * Ten methods, one per block, exactly as the interface has always had them. What changed
 * is where the strings come from — `content_strings`, addressed by the same section and
 * field keys the admin panel shows — and nothing above this layer can tell.
 *
 * WHAT STILL COMES FROM THE CONTENT MODULE, AND WHY.
 * The ASPECT RATIO of the hero accordion, the four differentiator cards and the five
 * reasons — a layout decision for the slot, never a property of whichever file sits in
 * it, so it stays structure. The file itself and its alt text both come from the
 * database now (see `pageMedia` in `./shared`), which is what makes a save reach the
 * live page at all.
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
      bands: bands(store, owner, shape.bands),
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
    return {
      heading: store.text(owner, "heading"),
      body: store.text(owner, "body"),
      leadIn: store.text(owner, "lead-in"),
      closingStatement: store.text(owner, "closing-statement"),
      elements: titles.map((title, index) => ({
        title,
        description: descriptions[index] ?? "",
        media: pageMedia(store, owner, index, aspectRatioAt(shape.elements, index, "element")),
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
      revealLabel: store.text("home:how-we-work", "reveal-button"),
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
      openLabel: store.text(owner, "open-button"),
      closeLabel: store.text(owner, "close-button"),
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
    return {
      heading: store.text(owner, "heading"),
      body: store.text(owner, "body"),
      reasons: titles.map((title, index) => ({
        title,
        description: descriptions[index] ?? "",
        media: pageMedia(store, owner, index, aspectRatioAt(shape.reasons, index, "reason")),
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
   * The two strings an editor can change are read from the store; everything else in the
   * footer is STRUCTURE, and structure is a code change rather than an edit.
   *
   * The Contact link, the legal column and the three social names are fixed shapes — a
   * fourth social network or a third legal document needs markup, not a row in a table.
   * The address and the descriptor are copy, but neither is the client's yet: the address
   * is null until one is confirmed and the descriptor is drafted pending approval, and
   * putting either in the panel would invite an editor to fill it in without the question
   * behind it ever being asked. They move into the store when the answers arrive.
   */
  async getFooterContent(): Promise<FooterContent> {
    const store = await this.home();
    const owner = "home:footer";
    return {
      ...(await this.structure.getFooterContent()),
      tagline: store.text(owner, "tagline"),
      contactEmail: store.text(owner, "contact-email"),
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
 * The one thing still taken from the content module for one of these repeated blocks: its
 * slot's aspect ratio, by position. An index past the end means the database has more
 * rows than the module has images — a seeding mismatch rather than something to paper
 * over, so it throws, naming which block, the same way a missing key does.
 */
function aspectRatioAt(
  shape: ReadonlyArray<{ readonly media: { readonly aspectRatio: MediaRef["aspectRatio"] } }>,
  index: number,
  noun: string,
): MediaRef["aspectRatio"] {
  const found = shape[index];
  if (!found) {
    throw new Error(
      `No ${noun} shape at position ${index}. The content module defines ${shape.length}; the database has more.`,
    );
  }
  return found.media.aspectRatio;
}

/**
 * The accordion's bands. The label is the list of record — a band with no label is a band
 * the accordion cannot caption — and the file and alt text beside it are read by position
 * from the same section, through `pageMedia`.
 */
function bands(
  store: ContentStore,
  owner: string,
  shape: ReadonlyArray<{ readonly media: MediaRef }>,
) {
  const labels = store.list(owner, "band-labels");
  return labels.map((label, index) => ({
    label,
    media: pageMedia(store, owner, index, aspectRatioAt(shape, index, "band")),
  }));
}
