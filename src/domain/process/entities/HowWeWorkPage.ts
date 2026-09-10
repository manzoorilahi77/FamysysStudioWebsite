import type { ClosingCtaBlock } from "../../marketing/entities/ClosingCtaBlock";
import type { FaqBlock } from "../../marketing/entities/FaqBlock";
import type { Cta } from "../../shared/value-objects/Cta";
import type { ProcessStepDetail } from "./ProcessStepDetail";

export interface ProcessHero {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
  readonly cta: Cta;
}

/**
 * One stage of the worked example, tied to a step by its approved title rather than by
 * position — so a reordered process cannot silently re-label the narrative.
 */
export interface WorkedExampleStage {
  readonly stepTitle: string;
  readonly text: string;
}

/**
 * A single project walked through all five steps. `pieceTitle` and `pieceDescription`
 * are read from the portfolio rather than restated, and `illustrativeNote` is rendered
 * on the page, not held in a comment: the piece has not been produced, so the reader has
 * to be told this is an illustration and not a record of delivered work.
 */
export interface WorkedExample {
  readonly eyebrow: string;
  readonly heading: string;
  readonly illustrativeNote: string;
  readonly pieceTitle: string;
  readonly pieceDescription: string;
  readonly stages: ReadonlyArray<WorkedExampleStage>;
}

export interface ScopeTopic {
  readonly title: string;
  readonly body: string;
}

/**
 * The honest expansion of the Refine step's "within the agreed scope". Every prospect
 * wonders where the line is; this is where the page answers it rather than leaving it to
 * a first invoice.
 */
export interface ScopeBlock {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
  readonly topics: ReadonlyArray<ScopeTopic>;
}

export interface ProcessFaq {
  readonly eyebrow: string;
  readonly heading: string;
  /**
   * The group on /faq this page's pointer opens — "services-and-capability" — as declared
   * in faq.content.ts. The page no longer renders its questions; it renders a pointer
   * under the same eyebrow and heading, and the pointer needs to land on the right part
   * of the page that does.
   */
  readonly group: string;
  readonly block: FaqBlock;
}

export interface HowWeWorkPage {
  readonly hero: ProcessHero;
  /** Accessible name for the step overview, which has no visible heading of its own. */
  readonly overviewLabel: string;
  readonly steps: ReadonlyArray<ProcessStepDetail>;
  /** Headings above each step's two lists. Content, not component literals. */
  readonly whatWeNeedLabel: string;
  readonly whatYouGetLabel: string;
  readonly workedExample: WorkedExample;
  readonly scope: ScopeBlock;
  readonly faq: ProcessFaq;
  readonly closingCta: ClosingCtaBlock;
}
