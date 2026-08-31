import type { ClosingCtaBlock } from "../../marketing/entities/ClosingCtaBlock";
import type { Cta } from "../../shared/value-objects/Cta";
import type { CaseStudyDetail, WorkCapabilityRef } from "./CaseStudyDetail";

export interface WorkHero {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
  readonly cta: Cta;
}

/**
 * The block that makes the rest of the page honest.
 *
 * None of the eight pieces has been produced. A grid of stock covers under real titles is
 * defensible as a homepage summary; at page scale, with a filter and a detail view over
 * it, it reads as a body of finished work unless the page says otherwise in its own
 * copy. This block is that saying — placed immediately after the hero, before the reader
 * has seen a single tile, and rendered as visible text rather than a footnote.
 */
export interface FramingBlock {
  readonly eyebrow: string;
  readonly heading: string;
  /** Two or three sentences, as separate paragraphs. */
  readonly paragraphs: ReadonlyArray<string>;
}

/**
 * One filter chip. The title is an approved capability name and the count is derived from
 * the pieces themselves, so a category can never exist with nothing behind it.
 */
export interface WorkCategory {
  readonly title: string;
  readonly count: number;
}

export interface WorkFilterBlock {
  /** Accessible name for the chip group. */
  readonly label: string;
  /** The chip that clears the filter, and the count of everything. */
  readonly allLabel: string;
  readonly categories: ReadonlyArray<WorkCategory>;
}

/** The labels the detail view needs. Content, not component literals. */
export interface WorkDetailLabels {
  readonly demonstratesLabel: string;
  readonly whyLabel: string;
  readonly capabilitiesLabel: string;
  readonly mediaSlotLabel: string;
  readonly closeLabel: string;
}

/**
 * One arc of the eight-piece progression. `pieceSlugs` references the pieces rather than
 * naming them, so the approved titles are resolved from the piece list at render and
 * cannot be restated here in a different form.
 */
export interface ProgressionStage {
  readonly title: string;
  readonly body: string;
  readonly pieceSlugs: ReadonlyArray<string>;
}

export interface ProgressionBlock {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
  readonly stages: ReadonlyArray<ProgressionStage>;
}

export interface CapabilityCrossLink {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
  readonly links: ReadonlyArray<WorkCapabilityRef>;
}

export interface SelectedWorkPage {
  readonly hero: WorkHero;
  readonly framing: FramingBlock;
  readonly filter: WorkFilterBlock;
  /** Accessible name for the grid section, which has no visible heading of its own. */
  readonly gridLabel: string;
  /**
   * The status marker, worded ONCE and rendered on every tile and in the detail view.
   * Nothing here has been produced, so every place a piece appears has to say so in the
   * same words — a second wording would read as two different states.
   */
  readonly statusLabel: string;
  /** The same fact in a sentence, for the detail view's media slot. */
  readonly statusExplanation: string;
  readonly pieces: ReadonlyArray<CaseStudyDetail>;
  readonly detail: WorkDetailLabels;
  readonly progression: ProgressionBlock;
  readonly capabilityCrossLink: CapabilityCrossLink;
  readonly closingCta: ClosingCtaBlock;
}
