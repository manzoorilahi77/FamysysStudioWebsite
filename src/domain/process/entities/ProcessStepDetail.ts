import type { ProcessStep } from "../../marketing/entities/ProcessStep";
import type { MediaRef } from "../../shared/value-objects/MediaRef";
import type { Slug } from "../../shared/value-objects/Slug";

/**
 * One process step as the How We Work page presents it: the homepage's step plus
 * everything a page-length treatment needs.
 *
 * It EXTENDS `ProcessStep` rather than replacing it, so a `ProcessStepDetail` is still
 * usable everywhere a step is — the homepage sequence, the Creative Services pointer —
 * and the approved `title` and `description` keep exactly one definition. The content
 * layer builds each detail by spreading the entry from `processBlock.steps`, so those two
 * strings are read from the approved source rather than retyped beside the draft copy.
 * Same arrangement as `CapabilityDetail` over `ServiceOffering`.
 */
export interface ProcessStepDetail extends ProcessStep {
  /** Anchor target for the overview's jump links. */
  readonly slug: Slug;
  readonly expandedCopy: string;
  /** What the client has to supply before the step can finish. 2-3 concrete items. */
  readonly whatWeNeed: ReadonlyArray<string>;
  /** What leaves the step and reaches the client. 2-3 concrete outputs. */
  readonly whatYouGet: ReadonlyArray<string>;
  readonly media: MediaRef;
}
