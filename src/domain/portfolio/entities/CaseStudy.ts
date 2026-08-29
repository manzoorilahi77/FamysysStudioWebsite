import type { Slug } from "../../shared/value-objects/Slug";
import type { MediaRef } from "../../shared/value-objects/MediaRef";

export interface CaseStudy {
  readonly slug: Slug;
  /** Two-digit reference from the brief's numbered list, shown as the tile's label chip. */
  readonly reference: string;
  readonly title: string;
  readonly description: string;
  readonly media: MediaRef;
}
