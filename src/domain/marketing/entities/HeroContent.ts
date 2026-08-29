import type { Cta } from "../../shared/value-objects/Cta";
import type { MediaRef } from "../../shared/value-objects/MediaRef";

export interface HeroContent {
  readonly heading: string;
  readonly body: string;
  readonly primaryCta: Cta;
  readonly secondaryCta: Cta;
  readonly supportingLine: string;
  readonly mosaicTiles: ReadonlyArray<MediaRef>;
}
