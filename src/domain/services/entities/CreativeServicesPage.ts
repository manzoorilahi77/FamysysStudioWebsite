import type { ClosingCtaBlock } from "../../marketing/entities/ClosingCtaBlock";
import type { FaqBlock } from "../../marketing/entities/FaqBlock";
import type { ProcessBlock } from "../../marketing/entities/ProcessBlock";
import type { Cta } from "../../shared/value-objects/Cta";
import type { MediaRef } from "../../shared/value-objects/MediaRef";
import type { CapabilityDetail } from "./CapabilityDetail";

export interface ServicesHero {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
  readonly cta: Cta;
  readonly media: MediaRef;
}

/**
 * A pointer block: enough of another page to orient the reader, and a link to the rest.
 * `process` carries the five steps verbatim so the sequence is not summarised into
 * something that could drift from the real one; only its heading is page-specific.
 */
export interface ProcessPointer {
  readonly eyebrow: string;
  readonly process: ProcessBlock;
  readonly cta: Cta;
}

/** One tier reduced to a name and a single line. The full content lives on its own page. */
export interface EngagementSummary {
  readonly name: string;
  readonly line: string;
}

export interface EngagementPointer {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
  readonly summaries: ReadonlyArray<EngagementSummary>;
  readonly cta: Cta;
}

export interface ServicesFaq {
  readonly eyebrow: string;
  readonly heading: string;
  readonly block: FaqBlock;
}

export interface CreativeServicesPage {
  readonly hero: ServicesHero;
  /** Accessible name for the anchor index, which has no visible heading of its own. */
  readonly indexLabel: string;
  /** Heading above each block's deliverables. Content, not a component literal. */
  readonly deliverablesLabel: string;
  readonly capabilities: ReadonlyArray<CapabilityDetail>;
  readonly processPointer: ProcessPointer;
  readonly engagementPointer: EngagementPointer;
  readonly faq: ServicesFaq;
  readonly closingCta: ClosingCtaBlock;
}
