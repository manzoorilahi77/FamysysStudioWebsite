import type { ClosingCtaBlock } from "../../marketing/entities/ClosingCtaBlock";
import type { FaqBlock } from "../../marketing/entities/FaqBlock";
import type { Cta } from "../../shared/value-objects/Cta";
import type { CustomPartnershipDetail, EngagementTierDetail } from "./EngagementTierDetail";

export interface EngagementHero {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
  readonly cta: Cta;
}

/**
 * The comparison's four row labels. `idealFor` and `typicalWork` are the brief's own
 * field names, imported from `marketing.content.ts` rather than restated; `bestWhen` and
 * `engagementShape` are drafted.
 */
export interface ComparisonRowLabels {
  readonly idealFor: string;
  readonly typicalWork: string;
  readonly bestWhen: string;
  readonly engagementShape: string;
}

/**
 * A fit-finder, not a pricing table. There are no ticks, crosses or withheld features:
 * every cell says what a tier IS, and no cell says what a tier lacks. The brief forbids
 * public pricing, and a feature-gating grid implies a price ladder even without numbers
 * on it.
 */
export interface TierComparison {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
  /** Accessible name for the table. Content, not a component literal. */
  readonly caption: string;
  readonly rowLabels: ComparisonRowLabels;
}

/** One self-selection question and the tier its answer points at. */
export interface ChoiceQuestion {
  readonly question: string;
  readonly answer: string;
  /** Slug of the tier block this answer links to. */
  readonly tierSlug: string;
  readonly tierName: string;
}

export interface HowToChoose {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
  readonly questions: ReadonlyArray<ChoiceQuestion>;
}

export interface ScopingStep {
  readonly title: string;
  readonly body: string;
}

/**
 * What happens between the first conversation and a quotation. States no duration
 * anywhere: a turnaround is an operational commitment, and the brief supplies none.
 */
export interface ScopingBlock {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
  readonly steps: ReadonlyArray<ScopingStep>;
}

export interface EngagementFaq {
  readonly eyebrow: string;
  readonly heading: string;
  readonly block: FaqBlock;
}

export interface WaysToWorkPage {
  readonly hero: EngagementHero;
  readonly comparison: TierComparison;
  /** The three named tiers, in the brief's order: Launch, Grow, Scale. */
  readonly tiers: ReadonlyArray<EngagementTierDetail>;
  readonly custom: CustomPartnershipDetail;
  readonly howToChoose: HowToChoose;
  readonly scoping: ScopingBlock;
  readonly faq: EngagementFaq;
  readonly closingCta: ClosingCtaBlock;
}
