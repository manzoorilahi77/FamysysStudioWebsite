import type { Cta } from "../../shared/value-objects/Cta";
import type { MediaRef } from "../../shared/value-objects/MediaRef";
import type { Slug } from "../../shared/value-objects/Slug";
import type { ServiceOffering } from "./ServiceOffering";

/**
 * A capability as the Creative Services page presents it: the homepage's offering plus
 * everything a page-length treatment needs.
 *
 * It EXTENDS `ServiceOffering` rather than replacing it, so a `CapabilityDetail` is still
 * usable everywhere an offering is — the homepage grid, the nav panel — and the approved
 * `title` and `description` keep exactly one definition. The content layer builds each
 * detail by spreading the catalog entry, so those two strings are read from the approved
 * source rather than retyped beside the draft copy.
 */
export interface CapabilityDetail extends ServiceOffering {
  /** Anchor target. Must match the fragment the nav panel already links to. */
  readonly slug: Slug;
  readonly expandedCopy: string;
  readonly deliverables: ReadonlyArray<string>;
  readonly media: MediaRef;
  readonly cta: Cta;
}
