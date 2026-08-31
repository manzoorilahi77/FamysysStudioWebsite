import type { CaseStudy } from "./CaseStudy";

/**
 * A capability the piece exercises, paired with the fragment on /creative-services that
 * describes it. The title is one of the six approved capability names — never a shortened
 * or reworded version — because it is also the filter chip's label, and a taxonomy the
 * page invented for itself would drift from the services page the moment either changed.
 */
export interface WorkCapabilityRef {
  readonly title: string;
  readonly href: string;
}

/**
 * A planned piece as the Selected Work page presents it.
 *
 * It EXTENDS `CaseStudy` rather than replacing it, so `title`, `description` (the
 * client's own one-line intent) and `reference` keep exactly one definition and cannot
 * drift from the homepage. The content layer builds each detail by spreading the entry
 * from `caseStudies`, so those strings are read from the client's approved copy rather
 * than retyped beside the draft. Same arrangement as `CapabilityDetail` over
 * `ServiceOffering` and `EngagementTierDetail` over `EngagementTier`.
 *
 * `media` is redeclared to document that this page carries its OWN cover, sized and
 * cropped for a page-scale grid rather than the homepage's summary tile. It is still a
 * stock frame standing in for work that has not been produced.
 */
export interface CaseStudyDetail extends CaseStudy {
  /** Drafted. What the piece is intended to demonstrate, beyond the one-line intent. */
  readonly demonstrates: string;
  /** Drafted. Why this piece is in the eight at all. */
  readonly whyThisPiece: string;
  readonly capabilities: ReadonlyArray<WorkCapabilityRef>;
}
