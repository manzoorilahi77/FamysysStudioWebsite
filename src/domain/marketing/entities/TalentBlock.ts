import type { MediaRef } from "../../shared/value-objects/MediaRef";

export interface TalentBlock {
  readonly eyebrow: string;
  readonly heading: string;
  readonly supportingParagraph: string;
  readonly tiles: ReadonlyArray<MediaRef>;
}
