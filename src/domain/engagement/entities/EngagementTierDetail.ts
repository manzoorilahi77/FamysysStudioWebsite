import type { CustomPartnership, EngagementTier } from "../../marketing/entities/EngagementTier";
import type { MediaRef } from "../../shared/value-objects/MediaRef";
import type { Slug } from "../../shared/value-objects/Slug";

/**
 * A tier as the Ways to Work With Us page presents it: the homepage's tier plus what a
 * page-length treatment needs.
 *
 * It EXTENDS `EngagementTier` rather than replacing it, so `name`, `descriptor`,
 * `summary`, `idealFor` and `typicalWork` keep exactly one definition and cannot drift
 * from the homepage. The content layer builds each detail by spreading the tier from
 * `waysToWorkBlock`, so those five strings are read from the client's approved copy
 * rather than retyped beside the draft. Same arrangement as `CapabilityDetail` over
 * `ServiceOffering` and `ProcessStepDetail` over `ProcessStep`.
 *
 * `idealForItems` and `typicalWorkItems` are the SAME approved strings, split for list
 * rendering — not a second copy. `StaticEngagementRepository.test.ts` re-joins each list
 * and asserts it reproduces the source string character for character, so the split can
 * never quietly drop or reword a clause.
 */
export interface EngagementTierDetail extends EngagementTier {
  /** Anchor target, so the How-to-choose answers can link straight to the block. */
  readonly slug: Slug;
  readonly expandedCopy: string;
  readonly idealForItems: ReadonlyArray<string>;
  readonly typicalWorkItems: ReadonlyArray<string>;
  /** Drafted. The comparison row that says when this tier is the right answer. */
  readonly bestWhen: string;
  /** Drafted. The comparison row that says how the engagement actually runs. */
  readonly engagementShape: string;
  readonly media: MediaRef;
}

/**
 * The custom partnership, expanded. It carries no `idealFor`/`typicalWork` because the
 * brief gives it none — it has an `invitation` instead, which the page sets larger than
 * the surrounding copy. `covers` is drafted and deliberately descriptive: shapes the
 * arrangement takes, never volumes, notice periods or terms.
 */
export interface CustomPartnershipDetail extends CustomPartnership {
  readonly slug: Slug;
  readonly expandedCopy: string;
  readonly coversLabel: string;
  readonly covers: ReadonlyArray<string>;
  readonly media: MediaRef;
}
