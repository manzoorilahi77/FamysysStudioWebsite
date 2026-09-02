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
 *
 * ONE paragraph, and the type says so. It was three, which is three times as much page
 * as the single idea needs: the studio chose not to fill this page with weak work. The
 * two facts a reader cannot do without — that nothing here is finished, and that every
 * cover is a stand-in — stay inside that one paragraph rather than moving to a footnote,
 * because the block is the page's position, not its disclaimer. Making the field
 * singular is what stops the elaboration growing back.
 */
export interface FramingBlock {
  readonly eyebrow: string;
  readonly heading: string;
  /** Two sentences at most. See above — this is a `string`, not a list, on purpose. */
  readonly body: string;
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

/**
 * The path out, and a navigation block rather than a section with an argument to make.
 * It carries no body: an eyebrow, a short heading and six named rows already say what
 * the rows do, and a two-sentence introduction above a list of links is the reader
 * paying for something they were about to be told by the links themselves.
 */
export interface CapabilityCrossLink {
  readonly eyebrow: string;
  readonly heading: string;
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
