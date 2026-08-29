import type { MediaRef } from "../../shared/value-objects/MediaRef";

export interface PositioningBlock {
  readonly eyebrow: string;
  readonly heading: string;
  readonly supportingParagraph: string;
  readonly media: MediaRef;
}
